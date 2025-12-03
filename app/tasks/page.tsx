"use client";

import { useEffect, useState } from "react";
import { useSession, useUser } from "@clerk/nextjs";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { LuPlus, LuTrash2, LuCheck, LuX } from "react-icons/lu";

interface Task {
  id: string;
  name: string;
  description: string | null;
  completed: boolean;
  created_at: string;
}

/**
 * Tasks 예제 페이지
 * 
 * Clerk + Supabase 통합의 모범 사례를 보여주는 예제입니다.
 * - Clerk로 인증된 사용자만 접근 가능
 * - 각 사용자는 자신의 tasks만 조회/생성/수정/삭제 가능
 * - RLS 정책이 자동으로 적용됨
 */
export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Clerk hooks
  const { user } = useUser();

  // Supabase client with Clerk token
  const supabase = useClerkSupabaseClient();

  // Tasks 로드
  useEffect(() => {
    if (!user) return;

    async function loadTasks() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error loading tasks:", error);
          return;
        }

        setTasks(data || []);
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, [user, supabase]);

  // Task 생성
  async function createTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      alert("작업 이름을 입력해주세요.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          completed: false,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating task:", error);
        alert("작업 생성에 실패했습니다: " + error.message);
        return;
      }

      // 성공 시 목록에 추가
      setTasks((prev) => [data, ...prev]);
      setName("");
      setDescription("");
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("작업 생성 중 오류가 발생했습니다.");
    }
  }

  // Task 완료 상태 토글
  async function toggleTask(taskId: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: !currentStatus })
        .eq("id", taskId);

      if (error) {
        console.error("Error updating task:", error);
        alert("작업 업데이트에 실패했습니다: " + error.message);
        return;
      }

      // 성공 시 로컬 상태 업데이트
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, completed: !currentStatus } : task
        )
      );
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("작업 업데이트 중 오류가 발생했습니다.");
    }
  }

  // Task 삭제
  async function deleteTask(taskId: string) {
    if (!confirm("정말 이 작업을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) {
        console.error("Error deleting task:", error);
        alert("작업 삭제에 실패했습니다: " + error.message);
        return;
      }

      // 성공 시 목록에서 제거
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("작업 삭제 중 오류가 발생했습니다.");
    }
  }

  // 로딩 중
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">로그인이 필요합니다</h1>
        <p className="text-gray-600">
          작업 목록을 보려면 먼저 로그인해주세요.
        </p>
        <Link href="/">
          <Button>홈으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <Link
          href="/"
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          ← 홈으로 돌아가기
        </Link>
        <h1 className="text-4xl font-bold mb-2">내 작업 목록</h1>
        <p className="text-gray-600">
          Clerk + Supabase 통합 예제입니다. 각 사용자는 자신의 작업만 볼 수
          있습니다.
        </p>
      </div>

      {/* 작업 추가 폼 */}
      <div className="mb-8 p-6 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-bold mb-4">새 작업 추가</h2>
        <form onSubmit={createTask} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              작업 이름 *
            </label>
            <Input
              id="name"
              type="text"
              placeholder="예: 회의 준비하기"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-2"
            >
              설명 (선택사항)
            </label>
            <Input
              id="description"
              type="text"
              placeholder="예: 내일 오전 10시 회의 자료 준비"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">
            <LuPlus className="w-4 h-4 mr-2" />
            작업 추가
          </Button>
        </form>
      </div>

      {/* 작업 목록 */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">작업 목록</h2>

        {loading ? (
          <div className="text-center py-8 text-gray-500">로딩 중...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border rounded-lg">
            <p>아직 작업이 없습니다.</p>
            <p className="text-sm mt-2">위 폼에서 새 작업을 추가해보세요!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 border rounded-lg flex items-start gap-4 ${
                  task.completed
                    ? "bg-gray-50 opacity-75"
                    : "bg-white"
                }`}
              >
                <button
                  onClick={() => toggleTask(task.id, task.completed)}
                  className={`mt-1 p-2 rounded ${
                    task.completed
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600"
                  } transition-colors`}
                  title={task.completed ? "완료 취소" : "완료 처리"}
                >
                  {task.completed ? (
                    <LuCheck className="w-5 h-5" />
                  ) : (
                    <LuX className="w-5 h-5" />
                  )}
                </button>

                <div className="flex-1">
                  <h3
                    className={`font-semibold ${
                      task.completed
                        ? "line-through text-gray-500"
                        : "text-gray-900"
                    }`}
                  >
                    {task.name}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {task.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    생성일: {new Date(task.created_at).toLocaleString("ko-KR")}
                  </p>
                </div>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="삭제"
                >
                  <LuTrash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 설명 */}
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-bold mb-2">💡 이 페이지의 작동 원리</h3>
        <ul className="text-sm text-blue-900 space-y-1 list-disc list-inside">
          <li>
            <strong>Clerk 인증:</strong> 로그인한 사용자만 접근 가능
          </li>
          <li>
            <strong>Supabase 클라이언트:</strong> Clerk 세션 토큰을 자동으로
            전달
          </li>
          <li>
            <strong>RLS 정책:</strong> 각 사용자는 자신의 작업만 조회/생성/수정/삭제
            가능
          </li>
          <li>
            <strong>자동 필터링:</strong> Supabase가 자동으로 현재 사용자의
            데이터만 반환
          </li>
        </ul>
      </div>
    </div>
  );
}


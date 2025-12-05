/**
 * Supabase Storage 유틸리티
 * 상품 이미지 업로드 및 관리 기능
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseStorage = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 상품 이미지 업로드
 * @param file 업로드할 파일
 * @param productId 상품 ID
 * @param clerkId 사용자 ID (Clerk)
 * @returns 업로드된 파일의 공개 URL
 */
export async function uploadProductImage(
  file: File,
  productId: string,
  clerkId: string
): Promise<string | null> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${productId}_${Date.now()}.${fileExt}`;
    const filePath = `products/${clerkId}/${fileName}`;

    const { data, error } = await supabaseStorage.storage
      .from("uploads")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading image:", error);
      return null;
    }

    // 공개 URL 가져오기
    const {
      data: { publicUrl },
    } = supabaseStorage.storage.from("uploads").getPublicUrl(filePath);

    return publicUrl;
  } catch (err) {
    console.error("Unexpected error uploading image:", err);
    return null;
  }
}

/**
 * 상품 이미지 삭제
 * @param filePath 삭제할 파일 경로
 */
export async function deleteProductImage(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabaseStorage.storage
      .from("uploads")
      .remove([filePath]);

    if (error) {
      console.error("Error deleting image:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Unexpected error deleting image:", err);
    return false;
  }
}


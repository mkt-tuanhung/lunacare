const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

export async function chatWithAI(message: string, context: any = {}): Promise<{ text: string, isAlert: boolean }> {
  if (!API_BASE) {
    return {
      text: "Chức năng AI chưa được kích hoạt. Vui lòng cấu hình EXPO_PUBLIC_API_BASE_URL.",
      isAlert: false
    };
  }

  try {
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Lỗi kết nối Backend');
    }

    return { text: data.text, isAlert: data.isAlert };

  } catch (error: any) {
    console.error("AI Error:", error);
    return {
      text: "Xin lỗi, hệ thống AI đang tạm gián đoạn. Bạn thử lại sau nhé!",
      isAlert: false
    };
  }
}

export async function chatWithAI(message: string, context: any = {}): Promise<{ text: string, isAlert: boolean }> {
  try {
    const response = await fetch('/api/chat', {
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
      text: "Xin lỗi, hệ thống AI đang quá tải hoặc bạn đang chạy dưới Local mà chưa config Vercel. Bạn thử lại sau nhé!",
      isAlert: false
    };
  }
}

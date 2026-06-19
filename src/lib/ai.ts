export async function chatWithAI(message: string, context: any = {}): Promise<{ text: string, isAlert: boolean }> {
  const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  
  // Chuẩn bị System Prompt cá nhân hóa dựa trên context
  const systemPrompt = `
Bạn là LunaCare AI - một trợ lý sức khỏe sinh sản, chu kỳ kinh nguyệt và tâm lý gia đình dành cho phụ nữ.
Tên người dùng: ${context.displayName || 'Vợ Yêu'}.
Sức khỏe: Mức độ stress (${context.stressLevel || 'Bình thường'}), Triệu chứng hay gặp (${context.worstSymptoms?.join(', ') || 'Không rõ'}).
Lưu ý quan trọng:
1. Bạn KHÔNG phải bác sĩ. Nếu người dùng hỏi uống thuốc gì hoặc có dấu hiệu nguy hiểm (đau dữ dội, ra máu quá nhiều), BẮT BUỘC khuyên đi khám bác sĩ.
2. Trả lời NGẮN GỌN, ấm áp, thấu cảm, giống như một người chị gái/bác sĩ tâm lý. Dưới 150 chữ. Trả lời bằng tiếng Việt.
`;

  try {
    let aiText = "";

    if (API_KEY) {
      // Dùng Gemini nếu có Key
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: systemPrompt + "\\n\\nCâu hỏi: " + message }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 250 }
          })
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error('Gemini error');
      aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Xin lỗi, mình không thể trả lời lúc này.";
    } else {
      // Dùng Free Open API (Pollinations) nếu không có Key (Không cần cấu hình, tự động chạy)
      const prompt = systemPrompt + "\\n\\nCâu hỏi của người dùng: " + message;
      const response = await fetch('https://text.pollinations.ai/prompt/' + encodeURIComponent(prompt), {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Free AI error');
      aiText = await response.text();
    }
    
    // Kiểm tra xem AI có khuyên đi khám bác sĩ không để bật cờ Alert
    const isAlert = aiText.toLowerCase().includes('bác sĩ') || aiText.toLowerCase().includes('cơ sở y tế') || aiText.toLowerCase().includes('bệnh viện');

    return { text: aiText, isAlert };

  } catch (error: any) {
    console.error("AI Error:", error);
    return {
      text: "Xin lỗi, đường truyền tới hệ thống AI đang quá tải. Bạn thử lại sau vài giây nhé!",
      isAlert: false
    };
  }
}

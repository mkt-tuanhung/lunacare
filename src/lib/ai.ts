export async function chatWithAI(message: string, context: any = {}): Promise<{ text: string, isAlert: boolean }> {
  const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  
  if (!API_KEY) {
    // Fallback Mock Response nếu chưa cấu hình API Key
    let fallbackText = "[Bản Demo] Mình là AI, nhưng hiện tại chưa được cấp API Key để suy luận. Vui lòng thêm EXPO_PUBLIC_GEMINI_API_KEY vào biến môi trường (.env) nhé!";
    let isAlert = false;
    
    if (message.toLowerCase().includes('đau')) {
      fallbackText = "Nếu đau bụng, bạn có thể chườm ấm. Nếu đau dữ dội, vui lòng khám bác sĩ.";
      isAlert = true;
    }
    
    // Simulate network delay
    await new Promise(r => setTimeout(r, 1000));
    return { text: fallbackText, isAlert };
  }

  // Chuẩn bị System Prompt cá nhân hóa dựa trên context
  const systemPrompt = `
    Bạn là LunaCare AI - một trợ lý sức khỏe sinh sản, chu kỳ kinh nguyệt và tâm lý gia đình dành cho phụ nữ.
    Tên người dùng: ${context.displayName || 'Vợ Yêu'}.
    Sức khỏe: Mức độ stress (${context.stressLevel || 'Bình thường'}), Triệu chứng hay gặp (${context.worstSymptoms?.join(', ') || 'Không rõ'}).
    Lưu ý quan trọng:
    1. Bạn KHÔNG phải bác sĩ. Nếu người dùng hỏi uống thuốc gì hoặc có dấu hiệu nguy hiểm (đau dữ dội, ra máu quá nhiều), BẮT BUỘC khuyên đi khám bác sĩ.
    2. Nếu người dùng hỏi về việc trễ kinh, hãy khuyên dùng que thử thai nếu có khả năng, hoặc khuyên thư giãn vì stress cũng làm trễ kinh.
    3. Trả lời NGẮN GỌN, ấm áp, thấu cảm, giống như một người chị gái/bác sĩ tâm lý. Dưới 150 chữ.
  `;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: systemPrompt + "\\n\\nCâu hỏi của người dùng: " + message }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 250,
          }
        })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Lỗi kết nối AI');
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Xin lỗi, mình không thể trả lời lúc này.";
    
    // Kiểm tra xem AI có khuyên đi khám bác sĩ không để bật cờ Alert
    const isAlert = aiText.toLowerCase().includes('bác sĩ') || aiText.toLowerCase().includes('cơ sở y tế') || aiText.toLowerCase().includes('bệnh viện');

    return {
      text: aiText,
      isAlert
    };

  } catch (error: any) {
    console.error("AI Error:", error);
    return {
      text: "Xin lỗi, đường truyền tới hệ thống AI đang gặp sự cố. Bạn thử lại sau nhé!",
      isAlert: false
    };
  }
}

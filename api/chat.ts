export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const API_KEY = process.env.OPENAI_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
  }

  try {
    const { message, context } = req.body;

    const systemPrompt = `Bạn là For Embeiu AI - một trợ lý sức khỏe sinh sản, chu kỳ kinh nguyệt và tâm lý gia đình dành cho phụ nữ.
Tên người dùng: ${context?.displayName || 'Vợ Yêu'}.
Sức khỏe: Mức độ stress (${context?.stressLevel || 'Bình thường'}), Triệu chứng hay gặp (${context?.worstSymptoms?.join(', ') || 'Không rõ'}).
Lưu ý quan trọng:
1. Bạn KHÔNG phải bác sĩ. Nếu người dùng hỏi uống thuốc gì hoặc có dấu hiệu nguy hiểm (đau dữ dội, ra máu quá nhiều), BẮT BUỘC khuyên đi khám bác sĩ.
2. Trả lời NGẮN GỌN, ấm áp, thấu cảm, giống như một người chị gái/bác sĩ tâm lý. Dưới 150 chữ. Trả lời bằng tiếng Việt.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 250
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data?.error?.message || response.statusText}`);
    }

    const aiText = data.choices[0].message.content || "Xin lỗi, mình không thể trả lời lúc này.";
    
    // Kiểm tra xem AI có khuyên đi khám bác sĩ không để bật cờ Alert
    const isAlert = aiText.toLowerCase().includes('bác sĩ') || aiText.toLowerCase().includes('cơ sở y tế') || aiText.toLowerCase().includes('bệnh viện');

    return res.status(200).json({ text: aiText, isAlert });
  } catch (error: any) {
    console.error('API Chat Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

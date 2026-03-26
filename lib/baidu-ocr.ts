/**
 * 百度 OCR 服务
 * 免费额度：每天 500 次
 * 文档：https://ai.baidu.com/ai-doc/OCR/Ek3h7xypm
 */

// 百度 OCR 配置
const BAIDU_OCR = {
  appId: process.env.BAIDU_OCR_APP_ID || '',
  apiKey: process.env.BAIDU_OCR_API_KEY || '',
  secretKey: process.env.BAIDU_OCR_SECRET_KEY || '',
};

// 缓存 access_token
let accessToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * 获取 access_token
 */
async function getAccessToken(): Promise<string> {
  // 如果 token 还在有效期内，直接返回
  if (accessToken && Date.now() < tokenExpiresAt) {
    return accessToken;
  }

  const response = await fetch(
    `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${BAIDU_OCR.apiKey}&client_secret=${BAIDU_OCR.secretKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }
  );

  const data = await response.json();

  if (data.error) {
    throw new Error(`获取百度 OCR token 失败：${data.error_description}`);
  }

  accessToken = data.access_token;
  // token 有效期 30 天，提前 1 天刷新
  tokenExpiresAt = Date.now() + (data.expires_in - 86400) * 1000;

  return accessToken!;
}

/**
 * 通用文字识别（含手写体）
 * @param imageBase64 Base64 编码的图片
 */
export async function recognizeText(imageBase64: string) {
  const token = await getAccessToken();

  const response = await fetch(
    `https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=${token}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `image=${encodeURIComponent(imageBase64)}`,
    }
  );

  const data = await response.json();

  if (data.error_code) {
    throw new Error(`百度 OCR 识别失败：${data.error_msg}`);
  }

  // 提取识别的文字
  const words = data.words_result?.map((item: any) => item.words).join('\n') || '';

  return {
    text: words,
    raw: data,
  };
}

/**
 * 表格文字识别
 * @param imageBase64 Base64 编码的图片
 */
export async function recognizeTable(imageBase64: string) {
  const token = await getAccessToken();

  const response = await fetch(
    `https://aip.baidubce.com/rest/2.0/ocr/v1/table?access_token=${token}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `image=${encodeURIComponent(imageBase64)}`,
    }
  );

  const data = await response.json();

  if (data.error_code) {
    throw new Error(`百度 OCR 表格识别失败：${data.error_msg}`);
  }

  return {
    tableData: data.tables_result || [],
    raw: data,
  };
}

/**
 * 公式识别
 * @param imageBase64 Base64 编码的图片
 */
export async function recognizeFormula(imageBase64: string) {
  const token = await getAccessToken();

  const response = await fetch(
    `https://aip.baidubce.com/rest/2.0/ocr/v1/formula?access_token=${token}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `image=${encodeURIComponent(imageBase64)}`,
    }
  );

  const data = await response.json();

  if (data.error_code) {
    throw new Error(`百度 OCR 公式识别失败：${data.error_msg}`);
  }

  return {
    formulas: data.words_result || [],
    raw: data,
  };
}

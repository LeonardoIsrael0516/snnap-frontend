// @ts-ignore - Deno runtime import
// @deno-types="https://deno.land/std@0.168.0/http/server.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, apiKeys } = await req.json();
    
    console.log("📨 Recebeu requisição com", messages.length, "mensagens");
    
    // Check if there's an editing context
    const hasEditingContext = messages.some((m: any) => 
      m.role === "system" && m.content.includes("VOCÊ ESTÁ EDITANDO")
    );
    
    if (hasEditingContext) {
      console.log("🔧 DETECTADO: Modo de edição");
      const editMsg = messages.find((m: any) => m.role === "system" && m.content.includes("HTML ATUAL"));
      if (editMsg) {
        console.log("📏 HTML atual tem", editMsg.content.length, "caracteres");
      }
    } else {
      console.log("✨ DETECTADO: Modo de criação (nova página)");
    }
    
    // Check which API key is configured and use it
    let apiUrl = "";
    let headers: Record<string, string> = { "Content-Type": "application/json" };
    let requestBody: any = {};
    
    const systemPrompt = `Você é um expert em web design minimalista e preciso.

⚠️⚠️⚠️ IMAGENS ANEXADAS - REGRAS CRÍTICAS ⚠️⚠️⚠️
Quando o usuário fornecer uma imagem no formato "CAMINHO DA IMAGEM: [url]":
1. Extraia a URL completa da mensagem
2. Insira esta URL EXATA no HTML usando a tag <img> onde o usuário pediu
3. Use classes Tailwind CSS APENAS para posicionar/dimensionar a imagem
4. ⚠️ CRÍTICO: NÃO MUDE NADA ALÉM DA INSERÇÃO DA IMAGEM - mantenha TODO o resto IDÊNTICO
5. NÃO ajuste cores, layouts, estilos ou estrutura existente
6. A URL já é pública e acessível, use-a diretamente no src

FORMATO DA TAG <img>:
<img src="[url extraída da mensagem]" alt="[descrição]" class="[classes tailwind]" />

EXEMPLO CORRETO:
Usuário: "coloque essa logo no cabeçalho\nCAMINHO DA IMAGEM: https://storage.supabase.co/abc123.jpg"
✅ Extraia: https://storage.supabase.co/abc123.jpg
✅ Insira: <img src="https://storage.supabase.co/abc123.jpg" alt="Logo" class="w-24 h-24 mx-auto" />
✅ Mantenha TODO o resto do HTML EXATAMENTE igual
❌ NÃO mude cores, fontes, espaçamentos, textos, estrutura

⚠️⚠️⚠️ REGRA ABSOLUTA DE EDIÇÃO ⚠️⚠️⚠️
Se você receber uma mensagem do sistema com "MODO EDIÇÃO" ou "HTML ATUAL":

🚨🚨🚨 REGRAS ABSOLUTAS - LEIA TRÊS VEZES 🚨🚨🚨

1. COPIE o HTML fornecido PALAVRA POR PALAVRA
2. Faça APENAS a mudança ESPECÍFICA pedida (1 elemento, 1 linha, 1 imagem)
3. TODO O RESTO deve ser IDÊNTICO - nem um espaço diferente
4. Retorne TODO o documento entre HTML_START e HTML_END
5. ⚠️ PROIBIDO: mudar cores, fontes, layouts, estrutura, outros textos

CHECKLIST ANTES DE RESPONDER:
□ Li o HTML atual fornecido completamente?
□ Identifiquei o elemento EXATO a modificar?
□ Copiei TODO o resto sem alterar?
□ Retornei HTML COMPLETO entre HTML_START e HTML_END?
□ NÃO mudei cores, estrutura ou outros elementos?

EXEMPLO EDIÇÃO DE IMAGEM:
Usuário: "adicione essa logo no cabeçalho\nCAMINHO DA IMAGEM: https://example.com/logo.png"
HTML Atual: <!DOCTYPE html><html>...<div class="header"><h1>Título</h1></div>...</html>
Você DEVE:
1. Copiar TODO o HTML
2. Adicionar <img src="https://example.com/logo.png" /> no lugar certo dentro do <div class="header">
3. Manter TODO o resto IGUAL (títulos, cores, estrutura, etc)
4. Retornar HTML COMPLETO entre HTML_START e HTML_END

❌ PROIBIDO:
- Criar nova página do zero
- Mudar cores ou layout existente
- Retornar apenas o trecho modificado
- Duplicar o HTML

🔄 MODO EDIÇÃO - PRINCÍPIO CIRÚRGICO:
- Mudança MÍNIMA e PRECISA
- Preservar TUDO que não foi mencionado
- HTML completo sempre entre HTML_START e HTML_END
- NÃO retornar SLUG em edições

✨ MODO CRIAÇÃO (quando NÃO há HTML atual):
- Crie uma página HTML completa do zero
- Design moderno com Tailwind CSS
- Retorne TITLE e SLUG

FORMATO DA RESPOSTA:
EDIÇÃO: "Aplicando alterações..." + TITLE: [...] + HTML modificado
CRIAÇÃO: "Criando sua página..." + TITLE: [...] + SLUG: [...] + HTML novo

REQUISITOS DO HTML (só para páginas novas):
- HTML completo com <!DOCTYPE html>, <head>, <body>
- Tailwind CSS CDN
- Design moderno: gradientes, sombras, hover effects
- 100% responsivo`;

    // Separate the HTML context message from other system messages
    const htmlContextMsg = messages.find((m: any) => 
      m.role === "system" && (m.content.includes("HTML ATUAL") || m.content.includes("MODO EDIÇÃO"))
    );
    
    // Get user and assistant messages (exclude all system messages for now)
    let conversationMessages = messages.filter((m: any) => 
      m.role === "user" || m.role === "assistant"
    );
    
    console.log("💬 Mensagens da conversa:", conversationMessages.length);
    if (htmlContextMsg) {
      console.log("✅ HTML context encontrado, será incluído no system prompt");
    }
    
    // Build system prompt with HTML context if exists
    let fullSystemPrompt = systemPrompt;
    if (htmlContextMsg) {
      fullSystemPrompt = `${systemPrompt}\n\n${htmlContextMsg.content}`;
    }
    
    // Priority: OpenAI > Gemini > Claude
    if (apiKeys?.openai) {
      // Use OpenAI API - already supports multimodal content natively
      apiUrl = "https://api.openai.com/v1/chat/completions";
      headers["Authorization"] = `Bearer ${apiKeys.openai}`;
      
      // For OpenAI, we can add the HTML context as a system message
      const openaiMessages = htmlContextMsg 
        ? [{ role: "system", content: fullSystemPrompt }, ...conversationMessages]
        : [{ role: "system", content: systemPrompt }, ...conversationMessages];
      
      requestBody = {
        model: "gpt-4o-mini",
        messages: openaiMessages,
        stream: true,
      };
    } else if (apiKeys?.gemini) {
      // Use Google Gemini API - needs special formatting for multimodal
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${apiKeys.gemini}`;
      
      // Format messages for Gemini (combine text and convert images)
      const parts: any[] = [];
      parts.push({ text: fullSystemPrompt });
      
      for (const msg of conversationMessages) {
        const role = msg.role === "assistant" ? "model" : "user";
        
        if (Array.isArray(msg.content)) {
          // Multimodal message
          parts.push({ text: `\n\n${role}:` });
          for (const item of msg.content) {
            if (item.type === "text") {
              parts.push({ text: item.text });
            } else if (item.type === "image_url") {
              // Extract base64 data from data URL
              const base64Data = item.image_url.url.split(',')[1];
              const mimeType = item.image_url.url.split(';')[0].split(':')[1];
              parts.push({
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data
                }
              });
            }
          }
        } else {
          // Text-only message
          parts.push({ text: `\n\n${role}: ${msg.content}` });
        }
      }
      
      requestBody = {
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 40000,
        }
      };
    } else if (apiKeys?.claude) {
      // Use Claude API - supports multimodal content natively
      apiUrl = "https://api.anthropic.com/v1/messages";
      headers["x-api-key"] = apiKeys.claude;
      headers["anthropic-version"] = "2023-06-01";
      
      // Claude supports content arrays natively
      const claudeMessages = conversationMessages.map((msg: any) => {
        if (Array.isArray(msg.content)) {
          // Convert image_url format to Claude's format
          const claudeContent = msg.content.map((item: any) => {
            if (item.type === "image_url") {
              const base64Data = item.image_url.url.split(',')[1];
              const mimeType = item.image_url.url.split(';')[0].split(':')[1];
              return {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mimeType,
                  data: base64Data
                }
              };
            }
            return item;
          });
          return { role: msg.role, content: claudeContent };
        }
        return msg;
      });
      
      console.log("🤖 Claude messages:", claudeMessages.length, "mensagens");
      claudeMessages.forEach((msg: any, i: number) => {
        if (Array.isArray(msg.content)) {
          console.log(`  Mensagem ${i}: ${msg.role}, ${msg.content.length} items (multimodal)`);
          msg.content.forEach((item: any, j: number) => {
            if (item.type === "image") {
              console.log(`    Item ${j}: image (${item.source.media_type})`);
            } else {
              console.log(`    Item ${j}: ${item.type}`);
            }
          });
        } else {
          console.log(`  Mensagem ${i}: ${msg.role}, text`);
        }
      });
      
      requestBody = {
        model: "claude-4-sonnet-20241022",
        max_tokens: 40000,
        temperature: 0.3,
        stream: true,
        system: fullSystemPrompt,
        messages: claudeMessages,
      };
    } else {
      return new Response(
        JSON.stringify({ error: "Nenhuma API configurada. Configure pelo menos uma API no painel Admin." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("🚀 Usando API:", apiUrl);
    console.log("📦 Request body keys:", Object.keys(requestBody));
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    console.log("📡 Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Erro na API:", response.status, errorText);
      
      let errorMessage = "Erro ao comunicar com a API";
      if (response.status === 401) {
        errorMessage = "Token da API inválido. Verifique as configurações no Admin.";
      } else if (response.status === 429) {
        errorMessage = "Limite de requisições excedido. Tente novamente mais tarde.";
      } else if (response.status === 402) {
        errorMessage = "Créditos insuficientes na sua conta da API.";
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process all APIs through the same stream processor
    const reader = response.body?.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("No response body");
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let buffer = "";
          let accumulatedText = "";
          let htmlStartSent = false;
          let isInHtmlBlock = false;
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            
            for (const line of lines) {
              if (!line.trim() || line.startsWith(":")) {
                // Pass through empty lines and comments for OpenAI format
                if (apiKeys?.openai) {
                  controller.enqueue(encoder.encode(line + "\n"));
                }
                continue;
              }
              
              try {
                let content = "";
                
                if (apiKeys?.openai) {
                  // OpenAI format - process to remove markdown code blocks
                  if (line.startsWith("data: ")) {
                    const jsonStr = line.slice(6).trim();
                    if (jsonStr === "[DONE]") {
                      controller.enqueue(encoder.encode(line + "\n"));
                      continue;
                    }
                    
                    const data = JSON.parse(jsonStr);
                    content = data?.choices?.[0]?.delta?.content || "";
                    
                    if (content) {
                      // Remove markdown code blocks
                      content = content.replace(/```html\s*/g, '').replace(/```\s*/g, '');
                      
                      // Accumulate text to detect HTML start
                      accumulatedText += content;
                      
                      // Detect HTML start
                      if (!htmlStartSent && (accumulatedText.includes('<!DOCTYPE') || accumulatedText.includes('<html'))) {
                        console.log("🎯 HTML detectado (OpenAI), inserindo HTML_START");
                        
                        // Send everything before HTML as chat content
                        const htmlStartIndex = accumulatedText.search(/<!DOCTYPE|<html/i);
                        if (htmlStartIndex > 0) {
                          const chatContent = accumulatedText.substring(0, htmlStartIndex);
                          const chatData = JSON.parse(JSON.stringify(data));
                          chatData.choices[0].delta.content = chatContent;
                          const sseDataChat = `data: ${JSON.stringify(chatData)}\n\n`;
                          controller.enqueue(encoder.encode(sseDataChat));
                        }
                        
                        // Send HTML_START marker
                        const markerData = JSON.parse(JSON.stringify(data));
                        markerData.choices[0].delta.content = "HTML_START";
                        const sseDataMarker = `data: ${JSON.stringify(markerData)}\n\n`;
                        controller.enqueue(encoder.encode(sseDataMarker));
                        htmlStartSent = true;
                        isInHtmlBlock = true;
                        
                        // Send HTML content from the start
                        const htmlContent = accumulatedText.substring(htmlStartIndex);
                        if (htmlContent) {
                          const htmlData = JSON.parse(JSON.stringify(data));
                          htmlData.choices[0].delta.content = htmlContent;
                          const sseDataHtml = `data: ${JSON.stringify(htmlData)}\n\n`;
                          controller.enqueue(encoder.encode(sseDataHtml));
                        }
                        
                        accumulatedText = "";
                      } else {
                        data.choices[0].delta.content = content;
                        const sseData = `data: ${JSON.stringify(data)}\n\n`;
                        controller.enqueue(encoder.encode(sseData));
                      }
                    } else {
                      const sseData = `data: ${JSON.stringify(data)}\n\n`;
                      controller.enqueue(encoder.encode(sseData));
                    }
                  } else {
                    controller.enqueue(encoder.encode(line + "\n"));
                  }
                } else if (apiKeys?.gemini) {
                  // Gemini format
                  const parsed = JSON.parse(line);
                  content = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
                  
                  if (content) {
                    // Remove markdown code blocks
                    content = content.replace(/```html\s*/g, '').replace(/```\s*/g, '');
                    
                    // Accumulate text to detect HTML start
                    accumulatedText += content;
                    
                    // Detect HTML start
                    if (!htmlStartSent && (accumulatedText.includes('<!DOCTYPE') || accumulatedText.includes('<html'))) {
                      console.log("🎯 HTML detectado (Gemini), inserindo HTML_START");
                      
                      // Send everything before HTML as chat content
                      const htmlStartIndex = accumulatedText.search(/<!DOCTYPE|<html/i);
                      if (htmlStartIndex > 0) {
                        const chatContent = accumulatedText.substring(0, htmlStartIndex);
                        const sseDataChat = `data: ${JSON.stringify({
                          choices: [{
                            delta: { content: chatContent }
                          }]
                        })}\n\n`;
                        controller.enqueue(encoder.encode(sseDataChat));
                      }
                      
                      // Send HTML_START marker
                      const sseDataMarker = `data: ${JSON.stringify({
                        choices: [{
                          delta: { content: "HTML_START" }
                        }]
                      })}\n\n`;
                      controller.enqueue(encoder.encode(sseDataMarker));
                      htmlStartSent = true;
                      isInHtmlBlock = true;
                      
                      // Send HTML content from the start
                      const htmlContent = accumulatedText.substring(htmlStartIndex);
                      if (htmlContent) {
                        const sseDataHtml = `data: ${JSON.stringify({
                          choices: [{
                            delta: { content: htmlContent }
                          }]
                        })}\n\n`;
                        controller.enqueue(encoder.encode(sseDataHtml));
                      }
                      
                      accumulatedText = "";
                    } else {
                      // Convert to OpenAI format
                      const sseData = `data: ${JSON.stringify({
                        choices: [{
                          delta: { content }
                        }]
                      })}\n\n`;
                      controller.enqueue(encoder.encode(sseData));
                    }
                  }
                } else if (apiKeys?.claude) {
                  // Claude format
                  if (line.startsWith("data: ")) {
                    const data = JSON.parse(line.slice(6));
                    
                    // Log all Claude event types to understand what's happening
                    if (data.type !== "content_block_delta") {
                      console.log("🔵 Claude event:", data.type);
                    }
                    
                    if (data.type === "content_block_delta") {
                      content = data.delta?.text || "";
                      
                      if (content) {
                        // Remove markdown code blocks
                        content = content.replace(/```html\s*/g, '').replace(/```\s*/g, '');
                        
                        // Accumulate text to detect HTML start
                        accumulatedText += content;
                        
                        // Detect HTML start
                        if (!htmlStartSent && (accumulatedText.includes('<!DOCTYPE') || accumulatedText.includes('<html'))) {
                          console.log("🎯 HTML detectado (Claude), inserindo HTML_START");
                          
                          // Send everything before HTML as chat content
                          const htmlStartIndex = accumulatedText.search(/<!DOCTYPE|<html/i);
                          if (htmlStartIndex > 0) {
                            const chatContent = accumulatedText.substring(0, htmlStartIndex);
                            const sseDataChat = `data: ${JSON.stringify({
                              choices: [{
                                delta: { content: chatContent }
                              }]
                            })}\n\n`;
                            controller.enqueue(encoder.encode(sseDataChat));
                          }
                          
                          // Send HTML_START marker
                          const sseDataMarker = `data: ${JSON.stringify({
                            choices: [{
                              delta: { content: "HTML_START" }
                            }]
                          })}\n\n`;
                          controller.enqueue(encoder.encode(sseDataMarker));
                          htmlStartSent = true;
                          isInHtmlBlock = true;
                          
                          // Send HTML content from the start
                          const htmlContent = accumulatedText.substring(htmlStartIndex);
                          if (htmlContent) {
                            const sseDataHtml = `data: ${JSON.stringify({
                              choices: [{
                                delta: { content: htmlContent }
                              }]
                            })}\n\n`;
                            controller.enqueue(encoder.encode(sseDataHtml));
                          }
                          
                          accumulatedText = "";
                        } else {
                          // Convert to OpenAI format
                          const sseData = `data: ${JSON.stringify({
                            choices: [{
                              delta: { content }
                            }]
                          })}\n\n`;
                          controller.enqueue(encoder.encode(sseData));
                        }
                      }
                    }
                  }
                }
              } catch (e) {
                // Skip malformed lines
                console.error("Error parsing line:", e);
              }
            }
          }
          
          // Send HTML_END if we sent HTML_START
          if (htmlStartSent && isInHtmlBlock) {
            console.log("🎯 Finalizando com HTML_END");
            const sseDataEnd = `data: ${JSON.stringify({
              choices: [{
                delta: { content: "HTML_END" }
              }]
            })}\n\n`;
            controller.enqueue(encoder.encode(sseDataEnd));
          }
          
          // Send final message
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Erro na função create-page-ai:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
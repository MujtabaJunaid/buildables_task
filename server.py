import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.environ.get("groq_api_key"))

class MessageRequest(BaseModel):
    message: str

@app.post("/api/chat")
async def chat(data: MessageRequest):
    user_message = data.message

    few_shot_prompt = f"""
    System: Act as a health professional advisor.
    Example 1:
    User: I need help with my order.
    Bot: Sure, I can assist you with that! Can you provide me with your order number?

    Example 2:
    User: I want to cancel my subscription.
    Bot: I can help with that. Please confirm your subscription ID, and I'll proceed with the cancellation.

    Example 3:
    User: How can I contact customer service?
    Bot: You can reach our customer service team at support@company.com or call us at 123-456-7890.

    User: {user_message}
    Bot:
    """

    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": few_shot_prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=150,
        )

        bot_message = chat_completion.choices[0].message.content.strip()
        return {"response": bot_message}

    except Exception as e:
        raise HTTPException(status_code=500, detail="There was an error processing your request. Please try again later.")

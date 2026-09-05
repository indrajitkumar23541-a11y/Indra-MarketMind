import os
from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from .vector_store import get_vector_store

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def get_rag_chain():
    # Initialize Groq LLM
    llm = ChatGroq(
        groq_api_key=GROQ_API_KEY,
        model_name="mixtral-8x7b-32768",
        temperature=0.3
    )

    # Initialize Vector Store Retriever
    vector_store = get_vector_store()
    retriever = vector_store.as_retriever(search_kwargs={"k": 5})

    # Define the System Prompt
    system_prompt = (
        "You are Indra-MarketMind's AI Assistant, an expert financial analyst. "
        "Use the provided context to answer the user's question about the stock market, "
        "sentiment, or financial news. If you don't know the answer, say you don't know.\n\n"
        "Context:\n{context}"
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}"),
    ])

    # Create the chains
    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)
    
    return rag_chain

def answer_query(query: str) -> str:
    rag_chain = get_rag_chain()
    response = rag_chain.invoke({"input": query})
    return response["answer"]

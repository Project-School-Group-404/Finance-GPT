import time
import streamlit as st
from GeneralQnA import answer  # Ensure this imports the graph correctly
st.title("🤖 LangGraph QnA Agent")
user_question = st.text_input("Ask your question:")
# if st.button("Get Answer"):
#     if user_question.strip():
#         with st.spinner("Getting answer..."):
#             response = answer(user_question)
#             st.success("Answer received!")
#             st.markdown(f"**Answer:** {response}")
#     else:
#         st.warning("Please enter a question.")
if st.button("Get Answer"):
    if user_question.strip():
        with st.spinner("Thinking..."):
            full_response = answer(user_question)

        # Typing animation starts
        placeholder = st.empty()
        output_text = ""

        for char in full_response:
            output_text += char
            placeholder.markdown(f"**Answer:**\n\n{output_text}")
            time.sleep(0.02)  # ⏱ Adjust speed here (0.02 for fast, 0.05 for slower)
    else:
        st.warning("Please enter a question.")
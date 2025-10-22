import { IoSend } from "react-icons/io5";
import * as C from "../../AppStyle";

function SendMessageForm({ text, handleTextChange, sendMessage }: any) {
  return (
    <C.ChatInputBar>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Mensagem..."
          autoComplete="off"
          value={text}
          onChange={handleTextChange}
        />
        <button type="submit">
          <IoSend size={25} />
        </button>
      </form>
    </C.ChatInputBar>
  );
}

export default SendMessageForm;

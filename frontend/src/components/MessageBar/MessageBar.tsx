import { useSelector } from "react-redux";
import styles from "./MessageBar.module.scss";
import { useDispatch } from "react-redux";
import type { RootState } from "../../app/store";
import { removeMessage } from "../../features/message";
import { useEffect } from "react";

const MessageBar = () => {
    const messages = useSelector((state: RootState) => state.messages);
    const dispatch = useDispatch();

    useEffect(() => {
        const timers = messages.map(msg => 
            setTimeout(() => {
                dispatch(removeMessage(msg.id));
            }, 2000)
        );
        return () => timers.forEach(timer => clearTimeout(timer));
    }, [messages, dispatch])

  return (
    <div>
      <div className={styles.messageContainer}>
        {messages.map((msg) => (
          <div key={msg.id} className={`${styles.message} ${styles[msg.type]}`}>
            <span>{msg.text}</span>
            <button onClick={() => dispatch(removeMessage(msg.id))}>✖</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessageBar;
import styled from "styled-components";
import { timeAgo } from "../MessageItem";
import { Timestamp } from "firebase/firestore";

interface SystemMessageProps {
  message: any;
}

export default function SystemMessage({ message }: SystemMessageProps) {
  // Extrai timestamp
  let date: Date;
  if (message.timestamp instanceof Timestamp) {
    date = message.timestamp.toDate();
  } else if (
    message.timestamp &&
    typeof message.timestamp === "object" &&
    "seconds" in message.timestamp
  ) {
    date = new Date(message.timestamp.seconds * 1000);
  } else if (typeof message.timestamp === "number") {
    date = new Date(message.timestamp);
  } else {
    date = new Date();
  }
  const formattedTime = timeAgo(date);

  return (
    <Container>
      <p>{message.text + " " + formattedTime}</p>
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  text-align: center;

  font-style: italic;
  margin: 10px 0;

  p {
    color: #a7a7a7;
    padding: 10px;
    margin: auto;
    width: max-content;
    // border-radius: 20px;
    font-size: 0.8em;
    // background-color: #212433;
  }
`;

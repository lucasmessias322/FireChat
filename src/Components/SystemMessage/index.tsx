import styled from "styled-components";

interface SystemMessageProps {
  message: any;
}

export default function SystemMessage({ message }: SystemMessageProps) {
  return (
    <Container>
      <p>{message.text}</p>
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

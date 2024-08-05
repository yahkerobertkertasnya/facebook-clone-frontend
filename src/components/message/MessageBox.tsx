import styles from "@/assets/styles/messages/messages.module.scss";
import MessageInput from "./MessageInput.tsx";
import { Message } from "@/gql/graphql.ts";
import { Navigate, useParams } from "react-router-dom";
import { useSubscription } from "@apollo/client";
import { VIEW_CONVERSATION } from "@/lib/query/message/viewConversation.graphql.ts";
import { useState } from "react";
import domPurify from "@/controller/domPurify.ts";
import useAuth from "@/hooks/use-auth.ts";
import SafeImage from "@/components/SafeImage.tsx";

export default function MessageBox() {
  const { conversationID } = useParams();
  const { auth } = useAuth();
  const [stop, setStop] = useState<boolean>(false);
  const { data, error } = useSubscription(VIEW_CONVERSATION, {
    variables: {
      conversation: conversationID,
    },
    skip: stop,
  });

  if (error && !error.message.includes("must be defined") && !stop) {
    return <Navigate to={"/messages"} />;
  } else if (error && error.message.includes("must be defined") && !stop) {
    setStop(true);
  }

  return (
    <div className={styles.chat}>
      <MessageInput conversationID={conversationID!} />
      {data &&
        data.viewConversation.map((message: Message, index: number) => {
          return (
            <div key={index}>
              {message.sender.username == auth?.username ? (
                <div className={styles.chatReceiver}>
                  <div>
                    {message.image ? (
                      <SafeImage
                        src={message.image}
                        type={"others"}
                      />
                    ) : message.post ? (
                      <div className={styles.post}>
                        <header>
                          <SafeImage
                            src={message.post.user.profile}
                            type={"user-profile"}
                          />
                          {message.post.user.firstName} {message.post.user.lastName}
                        </header>
                        <div className={styles.content}>
                          <img
                            src={message.post.files ? message.post.files[0]! : ""}
                            alt={""}
                          />
                          <div dangerouslySetInnerHTML={{ __html: domPurify(message.post.content) }} />
                        </div>
                      </div>
                    ) : (
                      message.message
                    )}
                  </div>
                </div>
              ) : (
                <div
                  key={index}
                  className={styles.chatSender}>
                  <div>
                    {message.image ? (
                      <SafeImage
                        src={message.image}
                        type={"others"}
                      />
                    ) : message.post ? (
                      <div className={styles.post}>
                        <header>
                          <SafeImage
                            src={message.post.user.profile}
                            type={"user-profile"}
                          />
                          {message.post.user.firstName} {message.post.user.lastName}
                        </header>
                        <div className={styles.content}>
                          <img
                            src={message.post.files ? message.post.files[0]! : ""}
                            alt={""}
                          />
                          <div dangerouslySetInnerHTML={{ __html: domPurify(message.post.content) }} />
                        </div>
                      </div>
                    ) : (
                      message.message
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}

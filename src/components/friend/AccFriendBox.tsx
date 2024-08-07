import styles from "@/assets/styles/friends/accFriendBox.module.scss";
import { Link } from "react-router-dom";
import { User } from "@/gql/graphql.ts";
import SafeImage from "@/components/SafeImage.tsx";

interface AccFriendBox {
  friend: User;
}

export default function AccFriendBox({ friend }: AccFriendBox) {
  return (
    <>
      <div className={styles.container}>
        <header>
          <Link to={"/user/" + friend.username}>
            <SafeImage
              src={friend.profile}
              type={"user-profile"}
              alt={"profile picture"}
            />
          </Link>
        </header>
        <div className={styles.content}>
          <h4>
            {friend.firstName} {friend.lastName}
          </h4>
          <p>{friend.username}</p>
        </div>
      </div>
    </>
  );
}

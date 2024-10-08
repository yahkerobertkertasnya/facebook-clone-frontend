import styles from "@/assets/styles/group/joinRequestModal.module.scss";
import { AiOutlineCheck, AiOutlineClose, AiOutlineSearch } from "react-icons/ai";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { GET_JOIN_REQUESTS } from "@/lib/query/group/getJoinRequest.graphql.ts";
import { useParams } from "react-router-dom";
import { debouncedError } from "@/utils/error-handler.ts";
import { Member, User } from "@/gql/graphql.ts";
import { RxCross1 } from "react-icons/rx";
import { APPROVE_MEMBER } from "@/lib/query/group/approveMember.graphql.ts";
import { DENY_MEMBER } from "@/lib/query/group/denyMember.graphql.ts";
import SafeImage from "@/components/SafeImage.tsx";

interface JoinRequestsModal {
  setJoinRequestsModalState: Dispatch<SetStateAction<boolean>>;
}

export default function JoinRequestsModal({ setJoinRequestsModalState }: JoinRequestsModal) {
  const [filter, setFilter] = useState("");
  const { groupId } = useParams();
  const [requests, setRequests] = useState<Member[]>([]);
  const { data } = useQuery(GET_JOIN_REQUESTS, {
    variables: {
      id: groupId,
    },
    fetchPolicy: "cache-and-network",
    onError: debouncedError,
  });
  const [approveMember] = useMutation(APPROVE_MEMBER);
  const [denyMember] = useMutation(DENY_MEMBER);

  const filteredRequests = useMemo(() => {
    return requests.filter((member) => {
      return member.user.firstName.toLowerCase().includes(filter.toLowerCase()) || member.user.lastName.toLowerCase().includes(filter.toLowerCase());
    });
  }, [filter]);
  const handleApprove = (user: User, approve: boolean) => {
    const filtered = requests.filter((member) => {
      return member.user.id.toString() != user.id.toString();
    });
    setRequests(filtered);

    if (approve) {
      approveMember({
        variables: {
          groupId: groupId,
          userId: user.id,
        },
      }).catch(debouncedError);
    } else {
      denyMember({
        variables: {
          groupId: groupId,
          userId: user.id,
        },
      }).catch(debouncedError);
    }
  };

  useEffect(() => {
    if (data) setRequests(data.getJoinRequests);
  }, [data]);

  return (
    <>
      <div className={styles.background}>
        <div className={styles.box}>
          <header>
            <h2>Join Requests</h2>
            <AiOutlineClose
              size={"1.5rem"}
              onClick={() => setJoinRequestsModalState(false)}
            />
          </header>
          <hr />
          <div className={styles.content}>
            <AiOutlineSearch size={"1.2rem"} />
            <input
              type={"text"}
              placeholder={"Search join requests..."}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className={styles.friendList}>
            {filteredRequests.map((member, index) => {
              const user = member.user;
              return (
                <div
                  key={index}
                  className={styles.friend}>
                  <div>
                    <SafeImage
                      src={user?.profile}
                      type={"user-profile"}
                    />
                    <span>
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                  <div className={styles.icons}>
                    <AiOutlineCheck
                      size={"1.2rem"}
                      onClick={() => handleApprove(user, true)}
                    />
                    <RxCross1
                      size={"1.2rem"}
                      onClick={() => handleApprove(user, false)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

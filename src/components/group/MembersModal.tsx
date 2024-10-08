import styles from "@/assets/styles/group/membersModal.module.scss";
import { AiOutlineClose, AiOutlineSearch } from "react-icons/ai";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { Member } from "@/gql/graphql.ts";
import { GrUserAdmin } from "react-icons/gr";
import { BiLogOut } from "react-icons/bi";
import { useMutation } from "@apollo/client";
import { PROMOTE_MEMBER } from "@/lib/query/group/promoteMember.graphql.ts";
import { useParams } from "react-router-dom";
import { debouncedError } from "@/utils/error-handler.ts";
import { RiAdminLine } from "react-icons/ri";
import { KICK_MEMBER } from "@/lib/query/group/kickMember.graphql.ts";
import SafeImage from "@/components/SafeImage.tsx";

interface MembersModal {
  members: Member[] | undefined;
  setMembersModalState: Dispatch<SetStateAction<boolean>>;
}

export default function MembersModal({ members, setMembersModalState }: MembersModal) {
  const [membersList, setMembersList] = useState<Member[]>([]);
  const [filter, setFilter] = useState("");
  const { groupId } = useParams();
  const [promoteMember] = useMutation(PROMOTE_MEMBER);
  const [kickMember] = useMutation(KICK_MEMBER);

  useEffect(() => {
    if (members) setMembersList(members);
  }, [members]);

  const filteredMember = useMemo(() => {
    return membersList.filter((member) => {
      return member.user.firstName.toLowerCase().includes(filter.toLowerCase()) || member.user.lastName.toLowerCase().includes(filter.toLowerCase());
    });
  }, [filter]);

  const handlePromote = (member: Member) => {
    const edited = membersList.map((mem) => {
      if (mem.user.id == member.user.id) {
        mem.role = "admin";
      }
      return mem;
    });

    setMembersList(edited);

    promoteMember({
      variables: {
        groupId: groupId,
        userId: member.user.id,
      },
    }).catch(debouncedError);
    setMembersModalState(false);
  };

  const handleKick = (member: Member) => {
    const filtered = membersList.filter((mem) => {
      return mem.user.id.toString() != member.user.id.toString();
    });
    setMembersList(filtered);

    kickMember({
      variables: {
        groupId: groupId,
        userId: member.user.id,
      },
    }).catch(debouncedError);
    setMembersModalState(false);
  };

  return (
    <>
      <div className={styles.background}>
        <div className={styles.box}>
          <header>
            <h2>Manage Members</h2>
            <AiOutlineClose
              size={"1.5rem"}
              onClick={() => setMembersModalState(false)}
            />
          </header>
          <hr />
          <div className={styles.content}>
            <AiOutlineSearch size={"1.2rem"} />
            <input
              type={"text"}
              placeholder={"Search members..."}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className={styles.friendList}>
            {filteredMember.map((member, index) => {
              if (member.role.toLowerCase() == "admin")
                return (
                  <div
                    key={index}
                    className={styles.friend}
                    // onClick={() => handleInvite(user.id)}
                  >
                    <div>
                      <SafeImage
                        src={member.user.profile}
                        type={"user-profile"}
                      />
                      <div className={styles.profile}>
                        <p>
                          {member.user.firstName} {member.user.lastName}
                        </p>
                        <span>{member.role.toLowerCase()}</span>
                      </div>
                    </div>
                    <div className={styles.icons}>
                      {member.role.toLowerCase() == "member" && member.approved && !member.requested && (
                        <>
                          <GrUserAdmin
                            size={"1.2rem"}
                            onClick={() => handlePromote(member)}
                          />
                          <BiLogOut
                            size={"1.2rem"}
                            onClick={() => handleKick(member)}
                          />
                        </>
                      )}
                    </div>
                  </div>
                );
            })}
            {filteredMember.map((member, index) => {
              if (member.role == "member")
                return (
                  <div
                    key={index}
                    className={styles.friend}
                    // onClick={() => handleInvite(user.id)}
                  >
                    <div>
                      <SafeImage
                        src={member.user.profile}
                        type={"user-profile"}
                      />
                      <div className={styles.profile}>
                        <p>
                          {member.user.firstName} {member.user.lastName}
                        </p>
                        <span>{member.role.toLowerCase()}</span>
                      </div>
                    </div>
                    <div className={styles.icons}>
                      {member.role.toLowerCase() == "member" && (
                        <>
                          <RiAdminLine
                            size={"1.2rem"}
                            onClick={() => handlePromote(member)}
                          />
                          <BiLogOut
                            size={"1.2rem"}
                            onClick={() => handleKick(member)}
                          />
                        </>
                      )}
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

import Loading from "@/components/Loading.tsx";
import styles from "@/assets/styles/user/user.module.scss";
import Navbar from "@/components/navbar/Navbar.tsx";
import { ChangeEvent, useState } from "react";
import { LiaBirthdayCakeSolid, LiaUserFriendsSolid } from "react-icons/lia";
import { BsFillPersonPlusFill, BsGenderAmbiguous } from "react-icons/bs";
import { MdOutlineMarkEmailRead } from "react-icons/md";
import type { FriendInput, Maybe, Post, User } from "@/gql/graphql.ts";
import PostBox from "@/components/post/PostBox.tsx";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import { GET_USER } from "@/lib/query/user/getUser.graphql.ts";
import { BiSolidMessageRoundedDetail, BiSolidPencil } from "react-icons/bi";
import { IoIosArrowDown, IoMdReverseCamera } from "react-icons/io";
import uploadStorage, { deleteStorage } from "@/lib/firebase/storage.ts";
import { UPDATE_USER_PROFILE } from "@/lib/query/user/updateUserProfile.graphql.ts";
import { UPDATE_USER_BACKGROUND } from "@/lib/query/user/updateUserBackground.graphql.ts";
import { debouncedError } from "@/utils/error-handler.ts";
import EditUserModal from "@/components/user/EditUserModal.tsx";
import { ADD_FRIEND } from "@/lib/query/friend/addFriend.graphql.ts";
import { CREATE_CONVERSATION } from "@/lib/query/message/createConversation.graphql.ts";
import ShareModal from "@/components/ShareModal.tsx";
import UserFriend from "@/components/user/UserFriend.tsx";
import PeopleMightKnowContainer from "@/components/friend/PeopleMightKnowContainer.tsx";
import { IoPeopleCircleOutline } from "react-icons/io5";
import { PiBellSimpleFill, PiBellSimpleSlashFill } from "react-icons/pi";
import { BLOCK_USER } from "@/lib/query/notification/blockUser.graphql.ts";
import promiseToast from "@/lib/toast/promiseToast.ts";
import { toast } from "react-toastify";
import useAuth from "@/hooks/use-auth.ts";
import { Nullable } from "@/types/utils";
import { AnimatePresence } from "framer-motion";
import SafeImage from "@/components/SafeImage.tsx";

export default function User() {
  const { username } = useParams();
  const [user, setUser] = useState<Nullable<User>>(null);
  const [isPost, setIsPost] = useState(true);
  const [modalState, setModalState] = useState(false);
  const [currPost, setCurrPost] = useState<Nullable<Post>>(null);
  const [shareModalState, setShareModalState] = useState(false);
  const [peopleMightKnowState, setPeopleMightKnowState] = useState(false);
  const navigate = useNavigate();
  const { loading } = useQuery(GET_USER, {
    variables: {
      username: username,
    },
    onCompleted: (dat) => {
      setUser(dat.getUser);
    },
    fetchPolicy: "cache-and-network",
    onError: () => navigate("/"),
  });
  const { auth } = useAuth();
  const [updateProfile] = useMutation(UPDATE_USER_PROFILE);
  const [updateBackground] = useMutation(UPDATE_USER_BACKGROUND);
  const [addFriend] = useMutation(ADD_FRIEND);
  const [createConversation] = useMutation(CREATE_CONVERSATION);
  const [blockUser] = useMutation(BLOCK_USER);

  const handleProfileInput = () => {
    const fileInput = document.getElementById("profileInput") as HTMLInputElement;
    fileInput.click();
  };

  const handleFriend = () => {
    if (user && auth) {
      const friendInput: FriendInput = {
        receiver: user.id,
        sender: auth.id,
      };
      addFriend({
        variables: {
          friendInput: friendInput,
        },
      })
        .then(() => {
          if (user.friended == "friends")
            setUser({
              ...user,
              friended: "not friends",
            });
          else if (user.friended == "pending")
            setUser({
              ...user,
              friended: "not friends",
            });
          else if (user.friended == "not friends")
            setUser({
              ...user,
              friended: "pending",
            });
        })
        .catch(debouncedError);
    }
  };

  const handleBackgroundInput = () => {
    const fileInput = document.getElementById("backgroundInput") as HTMLInputElement;
    fileInput.click();
  };

  const handleProfileFile = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target?.files?.[0] as File;

      const url = await uploadStorage("profile", file);

      if (user) {
        await deleteStorage(user.profile!);
        setUser({
          ...user,
          profile: url,
        });
      }

      await updateProfile({
        variables: {
          profile: url,
        },
      });

      toast.success("Profile updated");
    }
  };

  const handleBackgroundFile = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files?.[0] as File;

      const url = await uploadStorage("background", file);

      if (user) {
        await deleteStorage(user.background!);
        setUser({
          ...user,
          background: url,
        });
      }

      await updateBackground({
        variables: {
          background: url,
        },
      });

      toast.success("Background updated");
    }
  };

  const handleSendMessage = () => {
    createConversation({
      variables: {
        username: username,
      },
    })
      .then((data) => navigate(`/messages/${data.data.createConversation.id}`))
      .catch(debouncedError);
  };

  const handleBlock = () => {
    blockUser({
      variables: {
        username: user?.username,
      },
    }).catch(debouncedError);

    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        blocked: !prev.blocked,
      };
    });
  };

  return (
    <>
      {modalState && (
        <EditUserModal
          userDat={user!}
          setUserDat={setUser}
          setModalState={setModalState}
        />
      )}
      {shareModalState && (
        <ShareModal
          setShareModalState={setShareModalState}
          currPost={currPost}
        />
      )}
      {loading && <Loading />}
      <div
        id={"page"}
        className={styles.pageUser}>
        <Navbar />
        <header className={styles.header}>
          <div className={styles.headerContent}>
            {auth?.username == username && (
              <IoMdReverseCamera
                onClick={() => handleBackgroundInput()}
                color={"black"}
                size={"1.5rem"}
              />
            )}
            <input
              id={"backgroundInput"}
              className={"fileInput"}
              type={"file"}
              multiple={false}
              hidden={true}
              onChange={(e) => promiseToast(() => handleBackgroundFile(e))}
              accept={"image/*"}
            />
            <SafeImage
              className={styles.profileBackground}
              src={user?.background}
              type={"user-background"}
              alt={"profile background"}
            />
            <SafeImage
              className={styles.profilePicture}
              src={user?.profile}
              type={"user-profile"}
              alt={"profile picture"}
            />
            <div className={styles.circular}>
              {auth?.username == username && (
                <IoMdReverseCamera
                  onClick={() => handleProfileInput()}
                  color={"black"}
                  size={"1.5rem"}
                />
              )}
              <input
                id={"profileInput"}
                className={"fileInput"}
                type={"file"}
                multiple={false}
                hidden={true}
                onChange={(e) => promiseToast(() => handleProfileFile(e))}
                accept={"image/*"}
              />
            </div>
          </div>
          <div className={styles.profile}>
            <div className={styles.text}>
              <h1>{user?.username}</h1>
              <p>
                {user?.firstName} {user?.lastName}
              </p>
            </div>
            <span>
              {auth?.username == username ? (
                <button onClick={() => setModalState(true)}>
                  <BiSolidPencil size={"1.2rem"} />
                  Edit Profile
                </button>
              ) : (
                <div className={styles.container}>
                  {user?.friended == "friends" && (
                    <button onClick={() => handleFriend()}>
                      <BsFillPersonPlusFill />
                      Remove Friend
                    </button>
                  )}
                  {user?.friended == "not friends" && (
                    <button onClick={() => handleFriend()}>
                      <BsFillPersonPlusFill />
                      Add Friend
                    </button>
                  )}
                  {user?.friended == "pending" && (
                    <button onClick={() => handleFriend()}>
                      <BsFillPersonPlusFill />
                      Cancel Request
                    </button>
                  )}
                  <button onClick={() => handleSendMessage()}>
                    <BiSolidMessageRoundedDetail size={"1rem"} />
                    Message
                  </button>
                  {user?.username != auth?.username && (
                    <button onClick={() => handleBlock()}>
                      {user?.blocked ? (
                        <>
                          <PiBellSimpleSlashFill size={"1rem"} />
                        </>
                      ) : (
                        <>
                          <PiBellSimpleFill size={"1rem"} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
              <button
                className={peopleMightKnowState ? styles.mightKnow : styles.mightKnowActive}
                onClick={() => setPeopleMightKnowState(!peopleMightKnowState)}>
                <IoIosArrowDown size={"1.2rem"} />
              </button>
            </span>
          </div>
          <AnimatePresence>{peopleMightKnowState && <PeopleMightKnowContainer key={"pplMightKnow"} />}</AnimatePresence>
          <div className={styles.info}>
            <p>
              <BsGenderAmbiguous size={"1.3rem"} />
              {user?.gender}
            </p>
            <p>
              <MdOutlineMarkEmailRead size={"1.3rem"} />
              {user?.email}
            </p>
            <p>
              <LiaBirthdayCakeSolid size={"1.3rem"} />
              {new Date(user?.dob).toLocaleDateString("en-us", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
            <p>
              <LiaUserFriendsSolid size={"1.3rem"} />
              {user?.friendCount}
            </p>
            {user?.id != auth?.id && (
              <p>
                <IoPeopleCircleOutline size={"1.3rem"} />
                {user?.mutualCount}
              </p>
            )}
          </div>
          <div className={styles.buttons}>
            <button
              className={isPost ? styles.active : ""}
              onClick={() => setIsPost(true)}>
              Posts
            </button>
            <button
              className={!isPost ? styles.active : ""}
              onClick={() => setIsPost(false)}>
              Friends
            </button>
          </div>
        </header>
        <div className={isPost ? styles.content : styles.contentFriend}>
          {isPost ? (
            <div>
              {user &&
                user.posts?.map((post: Maybe<Post>) => {
                  if (post)
                    return (
                      <PostBox
                        key={post.id}
                        post={post}
                        setCurrPost={setCurrPost}
                        setShareModalState={setShareModalState}
                      />
                    );
                })}
              {user && user.posts?.length == 0 && <h4>No Posts</h4>}
            </div>
          ) : (
            <UserFriend />
          )}
        </div>
      </div>
    </>
  );
}

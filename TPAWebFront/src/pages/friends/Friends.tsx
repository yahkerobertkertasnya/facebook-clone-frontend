import styles from "../../assets/styles/friends/friends.module.scss";
import Navbar from "../../components/navbar/Navbar.tsx";
import { useContext, useState } from "react";
import Sidebar from "../../components/sidebar/Sidebar.tsx";
import SidebarButton from "../../components/sidebar/SidebarButton.tsx";
import { FaUserFriends } from "react-icons/fa";
import { BsFillPersonCheckFill, BsFillPersonFill, BsFillPersonPlusFill } from "react-icons/bs";
import FriendRequestSection from "../../components/friend/FriendRequestSection.tsx";
import AllFriendsSection from "../../components/friend/AllFriendsSection.tsx";
import { useQuery } from "@apollo/client";
import { GET_FRIENDS } from "../../../lib/query/friend/getFriends.graphql.ts";
import { debouncedError } from "../../../controller/errorHandler.ts";
import { User } from "../../../gql/graphql.ts";
import { AuthContext } from "../../components/context/AuthContextProvider.tsx";
import PeopleMightKnowSection from "../../components/friend/PeopleMightKnowSection.tsx";

export default function Friends() {
    const [friends, setFriends] = useState<User[]>([]);
    const { auth } = useContext(AuthContext);
    const [tab, setTab] = useState("all");
    useQuery(GET_FRIENDS, {
        variables: {
            username: auth?.username,
        },
        onError: debouncedError,
        onCompleted: (data) => {
            setFriends(data.getFriends);
        },
    });
    return (
        <>
            <div
                id={"page"}
                className={styles.page}
            >
                <Navbar />
                <div className={styles.content}>
                    <Sidebar title={"Friends"}>
                        <>
                            <div onClick={() => setTab("all")}>
                                <SidebarButton
                                    active={tab == "all"}
                                    text={"All"}
                                >
                                    <FaUserFriends
                                        active={tab == "all"}
                                        size={"1.5rem"}
                                    />
                                </SidebarButton>
                            </div>
                            <div onClick={() => setTab("request")}>
                                <SidebarButton
                                    active={tab == "request"}
                                    text={"Requests"}
                                >
                                    <BsFillPersonPlusFill size={"1.5rem"} />
                                </SidebarButton>
                            </div>
                            <div onClick={() => setTab("recommendation")}>
                                <SidebarButton
                                    active={tab == "recommendation"}
                                    text={"Recommendation"}
                                >
                                    <BsFillPersonCheckFill size={"1.5rem"} />
                                </SidebarButton>
                            </div>
                            <div onClick={() => setTab("friend")}>
                                <SidebarButton
                                    active={tab == "friend"}
                                    text={"All Friends"}
                                >
                                    <BsFillPersonFill size={"1.5rem"} />
                                </SidebarButton>
                            </div>
                        </>
                    </Sidebar>
                    <div className={styles.contentBox}>
                        {(tab == "all" || tab == "request") && (
                            <FriendRequestSection
                                key={Date.now() + 1}
                                setFriends={setFriends}
                            />
                        )}
                        {(tab == "all" || tab == "recommendation") && <PeopleMightKnowSection key={Date.now() + 2} />}
                        {(tab == "all" || tab == "friend") && (
                            <AllFriendsSection
                                key={Date.now() + 3}
                                friends={friends}
                            />
                        )}
                        <h1> a</h1>
                    </div>
                </div>
            </div>
        </>
    );
}
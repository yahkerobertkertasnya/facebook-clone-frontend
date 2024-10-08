import styles from "@/assets/styles/group/createGroup.module.scss";
import Navbar from "@/components/navbar/Navbar.tsx";
import { useState } from "react";
import CreateGroupSidebar from "@/components/group/CreateGroupSidebar.tsx";
import SafeImage from "@/components/SafeImage.tsx";
import { defaultGroupBackground, defaultUserProfile } from "@/utils/image-utils.ts";

const defaultGroupData = {
  name: "",
  privacy: "Public",
  about: "",
};

export type IGroupData = typeof defaultGroupData;

export default function CreateGroup() {
  const [groupData, setGroupData] = useState<IGroupData>({
    name: "",
    privacy: "Public",
    about: "",
  });

  return (
    <>
      <div className={styles.page}>
        <Navbar />
        <div className={styles.content}>
          <CreateGroupSidebar
            groupData={groupData}
            setGroupData={setGroupData}
          />
          <div className={styles.contentPage}>
            <div className={styles.box}>
              <h3>Group Preview</h3>
              <div className={styles.body}>
                <div className={styles.image}>
                  <SafeImage
                    src={defaultGroupBackground}
                    type={"user-profile"}
                    alt={"profile picture"}
                  />
                </div>
                <header>
                  <h2>{groupData.name == "" ? "Group name..." : groupData.name}</h2>
                  <p>{groupData.privacy} • 1 member</p>
                  <hr />
                  <div className={styles.tab}>
                    <h4>Discussion</h4>
                    <h4>People</h4>
                  </div>
                </header>
                <div className={styles.about}>
                  <h3>About</h3>
                  <p>{groupData.about == "" ? "About group..." : groupData.about}</p>
                </div>
                <div className={styles.inputHeader}>
                  <SafeImage
                    src={defaultUserProfile}
                    type={"user-profile"}
                    alt={"profile picture"}
                  />
                  <button>What's on your mind?</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

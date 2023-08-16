import styles from "../../assets/styles/post/newPost.module.scss";
import ProfilePicture from "../ProfilePicture.tsx";
import { ChangeEvent, Dispatch, SetStateAction, useContext, useState } from "react";
import ImageList from "../ImageList.tsx";
import uploadStorage from "../../../controller/firebase/storage.ts";
import { useMutation } from "@apollo/client";
import { CREATE_POST } from "../../../lib/query/post/createPost.graphql.ts";
import { Post, User } from "../../../gql/graphql.ts";
import { AuthContext } from "../context/AuthContextProvider.tsx";
import RichText from "../richText/RichText.tsx";
import { debouncedError } from "../../../controller/errorHandler.ts";
import { HiPencilSquare } from "react-icons/hi2";

interface NewPostModal {
    modalState: boolean;
    setModalState: Dispatch<SetStateAction<boolean>>;
    setData: Dispatch<SetStateAction<Post[]>>;
    data: Post[];
    setLoading: Dispatch<SetStateAction<boolean>>;
    setTagModalState: Dispatch<SetStateAction<boolean>>;
    setVisibilityModalState: Dispatch<SetStateAction<boolean>>;
    setTagList: Dispatch<SetStateAction<User[]>>;
    tagList: User[];
    setVisibilityList: Dispatch<SetStateAction<User[]>>;
    visibilityList: User[];
}

export default function NewPostModal({ modalState, setModalState, data, setData, setLoading, setTagModalState, setVisibilityModalState, setTagList, tagList, setVisibilityList, visibilityList }: NewPostModal) {
    const [files, setFiles] = useState<File[]>([]);
    const [content, setContent] = useState("");
    const [visibility, setVisibility] = useState("public");
    const [createPost] = useMutation(CREATE_POST);
    const [index, setIndex] = useState(0);
    const { auth } = useContext(AuthContext);

    const handleInput = () => {
        const fileInput = document.getElementsByClassName("fileInput")[0] as HTMLInputElement;

        fileInput.click();
    };

    const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
        const fileL = e.target.files as FileList;

        setFiles([...files, ...Array.from(fileL)]);
        setIndex(index + 1);
    };

    const handleClose = () => {
        setTagList([]);
        setVisibilityList([]);
        setFiles([]);
        setContent("");
        setVisibility("public");
        setModalState(false);
    };

    const handleSubmit = async () => {
        if (content.length === 0) return;
        setLoading(true);
        const urlList: string[] = [];
        for (const file of files) {
            const url = await uploadStorage("post", file);
            urlList.push(url);
        }

        const tagUserList = tagList.map((user) => user.id);
        const visibilityUserList = visibilityList.map((user) => user.id);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const { data: dat } = await createPost({
            variables: {
                post: {
                    content: content,
                    privacy: visibility,
                    files: urlList,
                    tags: tagUserList,
                    visibility: visibilityUserList,
                },
            },
        }).catch(debouncedError);

        setData([dat.createPost, ...data]);
        handleClose();
        setLoading(false);
    };

    if (!modalState) return <></>;

    return (
        <div className={styles.background}>
            <div className={files.length == 0 ? styles.box : styles.boxImage}>
                <header>
                    <h2>Create Post</h2>
                    <div
                        className={styles.close}
                        onClick={() => handleClose()}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="black"
                            className="bi bi-x-lg"
                            viewBox="0 0 16 16"
                        >
                            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
                        </svg>
                    </div>
                </header>
                <hr />
                <main>
                    <div className={styles.profile}>
                        <ProfilePicture
                            user={auth}
                            showBox={false}
                        />
                        <div className={styles.name}>
                            <div>
                                <b>
                                    {auth?.firstName} {auth?.lastName}
                                </b>
                                {tagList.length > 0 && " is with "}
                                {tagList.length == 1 && <div>{tagList[0].firstName + " " + tagList[0].lastName}</div>}
                                {tagList.length > 1 && (
                                    <div>
                                        <b>{tagList[0].firstName + " " + tagList[0].lastName} </b> <span>and {tagList.length - 1} others</span>
                                    </div>
                                )}
                            </div>
                            <div className={styles.select}>
                                <select
                                    value={visibility}
                                    onChange={(e) => setVisibility(e.target.value)}
                                >
                                    <option value="public">Public</option>
                                    <option value="friend">Friend</option>
                                    <option value="specific">Specific</option>
                                </select>
                                {visibility == "specific" && <HiPencilSquare onClick={() => setVisibilityModalState(true)} />}
                            </div>
                        </div>
                    </div>
                    <RichText setText={setContent} />
                    <div className={files.length > 0 ? styles.attachment : styles.attachmentHidden}>
                        <ImageList
                            files={files}
                            setFiles={setFiles}
                        />
                    </div>
                </main>
                <div className={styles.attachmentInput}>
                    <p>Add to your post</p>
                    <div className={styles.buttons}>
                        <div
                            className={styles.button}
                            onClick={() => handleInput()}
                        >
                            <input
                                className={"fileInput"}
                                type={"file"}
                                multiple={true}
                                hidden={true}
                                onChange={handleFiles}
                                key={index}
                                accept={"image/*, video/*"}
                            />
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="currentColor"
                                className="bi bi-image"
                                viewBox="0 0 16 16"
                            >
                                <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                                <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z" />
                            </svg>
                        </div>
                        <div
                            className={styles.button}
                            onClick={() => setTagModalState(true)}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="currentColor"
                                className="bi bi-person-fill-add"
                                viewBox="0 0 16 16"
                            >
                                <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 0 1-1 0v-1h-1a.5.5 0 0 1 0-1h1v-1a.5.5 0 0 1 1 0Zm-2-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                <path d="M2 13c0 1 1 1 1 1h5.256A4.493 4.493 0 0 1 8 12.5a4.49 4.49 0 0 1 1.544-3.393C9.077 9.038 8.564 9 8 9c-5 0-6 3-6 4Z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <button
                    className={styles.postButton}
                    disabled={content.length === 8 || content == "<p></p>"}
                    onClick={() => handleSubmit()}
                >
                    Post
                </button>
            </div>
        </div>
    );
}
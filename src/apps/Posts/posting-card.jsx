import React from "react";
import { useState } from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import "./posting-card.css";
import ModalRequests from "../Profile/modal-requests";
import ModalApproved from "../Profile/modal-approved";
import {
    deletePost,
    setActive,
    setInactive,
    requestToJoinGroup,
    isCurrentUserRequestPending,
    isCurrentUserRequestApproved,
    leaveGroup,
} from "../../firebase/helpers";
import { currentUserEmail } from "../../firebase/auth";

const PostingCards = ({ post }) => {
    const [postID, setPostID] = useState(postToID(post));
    const [isRequested, setisRequested] = useState(false);
    const [isApproved, setisApproved] = useState(false);
    const [isActive, setisActive] = useState(post.isActive);

    const handleRequest = (idkanymorebruh) => {
        if (post.owner === currentUserEmail()) {
            alert("can not join your own group");
        } else if (isApproved) {
            //if already joined, you probably are trying to leave
            leaveGroup(postID);
            alert("you have been removed from the group");
            setisApproved(false);
        } else if (!isRequested) {
            //if you have not requested yet
            requestToJoinGroup(postID);
            alert("request succesfully sent");
            setisRequested(true);
        } else if (isRequested) {
            leaveGroup(postID);
            alert("your request has been removed");
            setisRequested(false);
        }
    };

    //checking for previous request
    async function checkifRequested() {
        var status = await isCurrentUserRequestPending(postToID(post));
        //console.log(status);
        if (status) {
            setisRequested(true);
        } else {
            setisRequested(false);
        }
    }

    //checking if you are already part of this group
    async function checkifApproved() {
        var status = await isCurrentUserRequestApproved(postToID(post));
        //console.log(status);
        if (status) {
            setisApproved(true);
        } else {
            setisApproved(false);
        }
    }

    const handleDelete = () => {
        deletePost(postToID(post), post.owner);
        alert(
            "Your game " +
                post.title +
                " has been deleted, please refresh the page"
        );
    };

    const handleActivation = (theBool) => {
        if (theBool) {
            //if it is true meaning IT IS active, deactivate it
            console.log("1", post.isActive, "state:", isActive);
            setisActive(false);
            setInactive(postToID(post), post.owner);
            console.log("after function:", post.isActive);
            alert("your post has been deactivated");
        } else {
            //if it is FALSE meaning it is NOT active, activate it
            console.log("2x", post.isActive, "state", isActive);
            setisActive(true);
            setActive(postToID(post), post.owner);
            console.log("after function:", post.isActive);
            alert("your post has been activated!");
        }
    };

    const displayCorrectButtons = () => {
        if (post.owner === currentUserEmail() && post.isActive === true) {
            //if it is your own post
            return (
                <>
                    <Button
                        onClick={() => {
                            handleDelete();
                        }}
                        size="small"
                        variant="outlined"
                        color="error"
                    >
                        Delete
                    </Button>
                    <Button
                        onClick={() => {
                            handleActivation(isActive);
                        }}
                        size="small"
                        variant="outlined"
                        color="error"
                    >
                        Deactivate
                    </Button>
                    <ModalRequests thePost={post}></ModalRequests>
                    <ModalApproved thePost={post}></ModalApproved>
                </>
            );
        } else if (
            post.owner === currentUserEmail() &&
            post.isActive === false
        ) {
            return (
                <>
                    <Button
                        onClick={() => {
                            handleDelete();
                        }}
                        size="small"
                        variant="outlined"
                        color="error"
                    >
                        Delete
                    </Button>
                    <Button
                        onClick={() => {
                            handleActivation(isActive);
                        }}
                        size="small"
                        variant="outlined"
                        color="success"
                    >
                        Activate
                    </Button>
                    {/*<ModalRequests></ModalRequests>
                     <ModalApproved></ModalApproved> */}
                </>
            );
        } else {
            checkifRequested();
            checkifApproved();
            //if it is indeed someone else's post
            if (isRequested === true) {
                return (
                    <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => {
                            handleRequest(postID);
                        }}
                    >
                        Unrequest
                    </Button>
                    // console.log("you have already requested this group LOL")
                );
            } else if (isApproved === true) {
                return (
                    <>
                        <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => {
                                handleRequest(postID);
                            }}
                        >
                            Leave Group
                        </Button>
                        <ModalApproved thePost={post}></ModalApproved>
                    </>
                    // console.log("you have already requested this group LOL")
                );
            } else {
                //if you have not requested/joined yet
                return (
                    <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => {
                            handleRequest(postID);
                        }}
                    >
                        Request to Join
                    </Button>
                );
            }
        }
    };

    return (
        <Card variant="outlined" sx={{ width: 345, height: 200, boxShadow: 5 }}>
            <CardContent>
                <Typography
                    gutterBottom
                    variant="h5"
                    component="div"
                    className="title"
                >
                    {post.title}
                </Typography>
                <Typography variant="body1">
                    Location: {post.location}
                </Typography>
                <Typography variant="body1">
                    Players: {post.currPlayers}/{post.maxPlayers}
                </Typography>
                {/* <Typography variant="body2" color="text.secondary">
                    {post.description}
                </Typography> */}
            </CardContent>
            <CardActions>{displayCorrectButtons()}</CardActions>
        </Card>
    );
};

function postToID(post) {
    return `${post.owner}_${post.date.seconds}.${post.date.nanoseconds}`;
}

export default PostingCards;
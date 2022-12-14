import React, { useState } from "react";
import {
  getCurrentUserName,
  getCurrentUserDiscord,
  updateCurrentUserDiscord,
  updateCurrentUserName,
  getCurrentUserDescription,
  updateCurrentUserDescription,
} from "../../firebase/helpers";
import "./profile.css";
import PostingCards from "../Posts/posting-card";
import { currentUserEmail } from "../../firebase/auth";
import { db } from "../../firebase/config";
import { collection, query, where } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { createTheme, ThemeProvider } from "@mui/material";

const theme = {
  typography: {
    fontFamily: "serif",
    button: {
      fontSize: 12.5,
      hover: { color: "red" },
    },
  },
};

export default function Profile() {
  const [name, setName] = useState("Your Name");
  const [discord, setDiscord] = useState("Your discord");
  const [description, setDescription] = useState(
    "A description of yourself and interests (150 characters).  Rookie Dungeons and Dragon player with interests in all types of games. Looking to have fun"
  );
  const [active, setActive] = useState("edit");

  const postsRef = collection(db, "Posts");

  getCurrentUserName().then((response) => {
    setName(response);
  });
  getCurrentUserDiscord().then((response) => {
    if (!response) {
      setDiscord("Your discord");
    } else {
      setDiscord(response);
    }
  });
  getCurrentUserDescription().then((response) => {
    if (!response) {
      setDescription(
        "A short description of yourself and your interests (150 character limit)"
      );
    } else {
      setDescription(response);
    }
  });

  //Edit section
  function Edit() {
    const [tempDiscord, setTempDiscord] = useState("Your discord");
    const [tempName, setTempName] = useState(name);
    const [tempDescription, setTempDescription] = useState("");

    const handleSubmit = (event) => {
      event.preventDefault();
      if (tempName) {
        updateCurrentUserName(tempName);
      }
      if (tempDiscord && tempDiscord !== "Your discord") {
        updateCurrentUserDiscord(tempDiscord);
      }
      if (
        tempDescription &&
        tempDescription !==
          "A short description of yourself and your interests (150 character limit)"
      ) {
        updateCurrentUserDescription(tempDescription);
      }
      getCurrentUserName().then((response) => {
        setName(response);
      });
      getCurrentUserDiscord().then((response) => {
        if (!response) {
          setDiscord("Your discord");
        } else {
          setDiscord(response);
        }
      });
      getCurrentUserDescription().then((response) => {
        if (!response) {
          setDescription(
            "A short description of yourself and your interests (150 character limit)"
          );
        } else {
          setDescription(response);
        }
      });
    };
    return (
      <div className="edit">
        <h3>EDIT PROFILE</h3>
        <form id="update" onSubmit={handleSubmit}>
          <div className="edit-parent">
            <div className="edit-item">
              <label>
                <p>Name</p>
              </label>
              <input
                type="text"
                name="name"
                placeholder={name}
                onChange={(e) => setTempName(e.target.value)}
              />
            </div>
            <div className="edit-item">
              <label>Discord</label>
              <input
                type="text"
                name="discord"
                placeholder={discord}
                onChange={(e) => setTempDiscord(e.target.value)}
              />
            </div>
            <div className="edit-description">
              <label>Description</label>
              <input
                type="text"
                name="discord"
                maxLength="150"
                placeholder={description}
                onChange={(e) => setTempDescription(e.target.value)}
              />
            </div>
            <button className="non-mui-button" type="submit">
              Update
            </button>
          </div>
        </form>
      </div>
    );
  }
  //User's postings section
  function Postings() {
    const [active_postsSnapshot, a_postsLoading, a_postsError] = useCollection(
      query(
        postsRef,
        where("isActive", "==", true),
        where("owner", "==", currentUserEmail())
      )
    );
    const [inactive_postsSnapshot, i_postsLoading, i_postsError] =
      useCollection(
        query(
          postsRef,
          where("isActive", "==", false),
          where("owner", "==", currentUserEmail())
        )
      );

    return (
      <div className="postings">
        <h3>MY POSTINGS</h3>
        <h4>ACTIVE</h4>
        <div className="post-grid">
          {active_postsSnapshot === undefined || active_postsSnapshot.empty ? (
            <p>No active posts!</p>
          ) : (
            active_postsSnapshot.docs.map((post) => {
              return (
                <div className="post-card">
                  <ThemeProvider theme={createTheme(theme)}>
                    <PostingCards
                      key={post.data().date}
                      post={post.data()}
                    ></PostingCards>
                  </ThemeProvider>
                </div>
              );
            })
          )}
        </div>
        <h4>INACTIVE</h4>
        <div className="post-grid">
          {inactive_postsSnapshot === undefined ||
          inactive_postsSnapshot.empty ? (
            <p>No inactive posts!</p>
          ) : (
            inactive_postsSnapshot.docs.map((post) => {
              return (
                <div className="post-card">
                  <ThemeProvider theme={createTheme(theme)}>
                    <PostingCards key={post.data().date} post={post.data()} />
                  </ThemeProvider>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  //User's pending requests section
  function PendingRequests() {
    const [postsSnapshot, postsLoading, postsError] = useCollection(
      query(
        postsRef,
        where("isActive", "==", true),
        where("pendingUsers", "array-contains", currentUserEmail())
      )
    );

    return (
      <div className="pendingRequests">
        <h3>PENDING</h3>
        <div className="post-grid">
          {postsSnapshot &&
            postsSnapshot.docs.map((post) => {
              return (
                <div className="post-card">
                  <ThemeProvider theme={createTheme(theme)}>
                    <PostingCards key={post.data().date} post={post.data()} />
                  </ThemeProvider>
                </div>
              );
            })}
        </div>
      </div>
    );
  }

  //User's pending requests section
  function ApprovedRequests() {
    const [postsSnapshot, postsLoading, postsError] = useCollection(
      query(
        postsRef,
        where("isActive", "==", true),
        where("approvedUsers", "array-contains", currentUserEmail())
      )
    );

    return (
      <div className="approvedRequests">
        <h3>APPROVED</h3>
        <div className="post-grid">
          {postsSnapshot &&
            postsSnapshot.docs.map((post) => {
              return (
                <div className="post-card">
                  <ThemeProvider theme={createTheme(theme)}>
                    <PostingCards key={post.data().date} post={post.data()} />
                  </ThemeProvider>
                </div>
              );
            })}
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h1>My Profile</h1>
      <div className="container">
        <div className="sub-container">
          <div className="filler"></div>
          <h3>{name}</h3>
          <div className="profile-info">
            <p className="info-tag">Email:</p>
            <p className="info">{currentUserEmail()}</p>
            <p className="info-tag">Discord:</p>
            <p className="info">{discord}</p>
            <p className="info-tag">Description:</p>
            <div className="description-container">
              <p className="info-description">{description}</p>
            </div>
          </div>
        </div>
        <div className="sub-container">
          <div className="section-toggle">
            <ul className="toggle-options">
              <li>
                <button
                  className="non-mui-button"
                  onClick={() => setActive("edit")}
                >
                  Edit Profile
                </button>
              </li>
              <li>
                <button
                  className="non-mui-button"
                  onClick={() => setActive("postings")}
                >
                  My Postings
                </button>
              </li>
              <li>
                <button
                  className="non-mui-button"
                  onClick={() => setActive("pendingRequests")}
                >
                  Pending
                </button>
              </li>
              <li>
                <button
                  className="non-mui-button"
                  onClick={() => setActive("approvedRequests")}
                >
                  Approved
                </button>
              </li>
            </ul>
          </div>
          <div className="section">
            {active === "edit" && <Edit />}
            {active === "postings" && <Postings />}
            {active === "pendingRequests" && <PendingRequests />}
            {active === "approvedRequests" && <ApprovedRequests />}
          </div>
        </div>
      </div>
    </div>
  );
}

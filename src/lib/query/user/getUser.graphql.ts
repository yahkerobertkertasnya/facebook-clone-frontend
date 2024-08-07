import { gql } from "@apollo/client";

export const GET_USER = gql`
  query getUser($username: String!) {
    getUser(username: $username) {
      id
      firstName
      lastName
      username
      email
      dob
      gender
      active
      profile
      background
      friended
      friendCount
      mutualCount
      blocked
      posts {
        id
        user {
          firstName
          lastName
          username
          profile
          dob
          gender
          email
        }
        content
        privacy
        likeCount
        commentCount
        shareCount
        liked
        files
        createdAt
      }
    }
  }
`;

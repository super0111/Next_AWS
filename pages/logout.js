/*
logout user using aws cogito
 */
import { Button } from "@mui/material";
import Router from "next/router";
import { Auth } from 'aws-amplify';



const LogoutPage = (props) => {

    Auth.signOut()
    .then(data => {console.log("User was logged out"); Router.push("/");})
    .catch(err => console.log(err));

    return null;
}
export default LogoutPage;

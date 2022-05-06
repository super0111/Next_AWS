import * as React from 'react';
import Router from "next/router";
import ListItem from '@mui/material/ListItem';
import 'bootstrap/dist/css/bootstrap.css';
import Divider from '@material-ui/core/Divider';


export const mainListItems = (
  <div className="d-flex flex-row" style={{ color: "black" }}>
    <div>
      <ListItem className="header-model-menu" button onClick={() => {
        Router.push("/");
      }}>
        <div> Models  </div>
        {/* <ListItemText primary="Models" /> */}
      </ListItem>
    </div>
    <div>
      <ListItem className="header-mymodel-menu" button onClick={() => {
        Router.push("/mymodels");
      }}>
        <div> My Models  </div>
      </ListItem>
      <Divider style={{ color: 'blue' }}/>
    </div>
    <div>
      <ListItem className="header-payment-menu" button onClick={() => {
        Router.push("/invoices");
      }}>
        <div> Payments  </div>
      </ListItem>
    </div>
  </div>
);

import * as React from 'react';
import Router from "next/router";
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import GlobalStyles from '@mui/material/GlobalStyles';
import Container from '@mui/material/Container';

import { Auth } from 'aws-amplify';
import Amplify from '@aws-amplify/core';
import awsconfig from '../aws-export';
Amplify.configure(awsconfig);

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="">
        Inferencehub
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}



const footers = [
  {
    title: 'Company',
    description: ['Team', 'History', 'Contact us', 'Locations'],
  },
  {
    title: 'Features',
    description: [
      'Cool stuff',
      'Random feature',
      'Team feature',
      'Developer stuff',
      'Another one',
    ],
  },
  {
    title: 'Resources',
    description: ['Resource', 'Resource name', 'Another resource', 'Final resource'],
  },
  {
    title: 'Legal',
    description: ['Privacy policy', 'Terms of use'],
  },
];

function LandingContent() {
  const handleSignIn = () => {
    Auth.federatedSignIn()
      .then((response) => {
      })
      .catch(err => console.log(err));
  }
  const handleShowModels = (e) => {
    e.preventDefault();
    getUser().then(userData => {
      if (userData) {
        Router.push('/models')
      } else {
        handleSignIn();
      }
    });
  }
  const getUser = () => {
    return Auth.currentAuthenticatedUser()
      .then(userData => userData)
      .catch(() => console.log('Not signed in'));
  }
  return (
    <React.Fragment>
      <GlobalStyles styles={{ ul: { margin: 0, padding: 0, listStyle: 'none' } }} />
      <CssBaseline />
      <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
      >
        <Toolbar sx={{ flexWrap: 'wrap' }} className="nav">
          <Typography variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
            Inferencehub
          </Typography>
          <nav>
            <Link
              variant="button"
              color="text.primary"
              sx={{ my: 1, mx: 1.5 }}
              onClick={(e) => handleShowModels(e)}
            >
              Models
            </Link>
          </nav>
          <Button href="#" variant="outlined" sx={{ my: 1, mx: 1.5 }} onClick={handleSignIn}>
            Login
          </Button>
        </Toolbar>
      </AppBar>
      {/* Hero unit */}
      <Container disableGutters width="80%" component="main" sx={{ pt: 14, pb:6 }}>
        <Typography
          component="h1"
          variant="h4"
          align="center"
          color="text.primary"
        >
          Welcome to Inferencehub
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" component="p"  sx={{ pt: 8, pb:6}} >
          Inferencehub allows you to upload your machine learning models,
          invest in others' work, or sell your own weights in one place.
           We worked hard on simplifying the workflows to ensure great usability.
           A lot of effort, time, and resources are spent on the training and development of Deep Learning models.
            Whenever you are starting with a new Deep Learning project you should definitely first check out the existing models we offer.
          This way you can build upon the work of others and save a lot of time and resources.
        </Typography>
      </Container>
      {/* End hero unit */}



      <Container
        maxWidth="md"
        component="footer"
        sx={{
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          mt: 8,
          py: [3, 6],
        }}
      >
        <Grid container spacing={4} justifyContent="space-evenly">
        {/*
          {footers.map((footer) => (
            <Grid item xs={6} sm={3} key={footer.title}>
              <Typography variant="h6" color="text.primary" gutterBottom>
                {footer.title}
              </Typography>
              <ul>
                {footer.description.map((item) => (
                  <li key={item}>
                    <Link href="#" variant="subtitle1" color="text.secondary">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </Grid>
          ))}
          */}
        </Grid>
        <Copyright sx={{ mt: 5 }} />
      </Container>



    </React.Fragment>
  );
}

export default function Pricing() {
  return <LandingContent />;
}


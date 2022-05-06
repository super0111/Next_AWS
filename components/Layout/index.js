import * as React from 'react';
import Router from "next/router";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import CustomAppBar from '../Header/index.js';
import SideNavBar from '../Sidenav/index.js';
import { Auth, Hub } from 'aws-amplify';
import Amplify from '@aws-amplify/core';
import awsconfig from '../../aws-export';
Amplify.configure(awsconfig);

const mdTheme = createTheme();
const Layout = ({ children, }) => {
    const [mode, setMode] = React.useState('light');
    const [logged, setLogged] = React.useState(false);
    React.useEffect(() => {
        getUser().then(userData => {
            if (!userData) {
                Router.push('/');
            } else {
                setLogged(true);
            }
        });
    }, [])
    const getUser = () => {
        return Auth.currentAuthenticatedUser()
            .then(userData => userData)
            .catch(() => {
                Auth.federatedSignIn()
            });
    }
    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                },
            }),
        [mode],
    );
    const [open, setOpen] = React.useState(true);
    const toggleDrawer = () => {
        setOpen(!open);
    };
    return (
        <>{ logged && (
            <ThemeProvider theme={theme}>
                <Box className="d-flex flex-column" sx={{
                    bgcolor: 'background.default',
                    color: 'text.primary',
                }}>
                    <CssBaseline />
                    <CustomAppBar open={open} setOpen={toggleDrawer} />
                    <div className="d-flex flex-row">
                        <SideNavBar style={{ width: "100%" }} open={open} setOpen={toggleDrawer} />
                        <Box style={{ width: "85%", padding: 50, marginTop: 50, marginLeft: 20 }}>
                            {/* <Toolbar /> */}
                            {children || null}
                        </Box>
                    </div>
                </Box>
            </ThemeProvider>
        )}
        </>
    );
}
export default Layout;

import * as React from 'react';
const Footer = ({ open }) => {
    const drawerWidth = 240;
    return (
        <footer className="footer-section" style={{
            left: open ? drawerWidth : 0,
            width: open ? `calc(100% - ${drawerWidth}px)` : '100%',
        }}>
            <div className="container">
                <div className="copyright">
                    <p>© TransferHub 2021. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
}
export default Footer;
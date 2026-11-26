'use client';

import Ambient from './Ambient';
import Sidebar, { Logo } from './Sidebar';
import MobileNav from './MobileNav';
import PlayerBar from './PlayerBar';
import NowPlaying from './NowPlaying';
import MenuHost from './MenuHost';
import Toast from './Toast';

export default function Shell({ children }) {
  return (
    <>
      <Ambient />
      <Sidebar />
      <div className="m-head"><Logo /></div>
      <main className="main">{children}</main>
      <MobileNav />
      <PlayerBar />
      <NowPlaying />
      <MenuHost />
      <Toast />
      <div className="yt-wrap" aria-hidden="true">
        <div id="yt-holder" />
      </div>
    </>
  );
}

'use client';

import Ambient from './Ambient';
import Sidebar, { Logo } from './Sidebar';
import MobileNav from './MobileNav';
import PlayerBar from './PlayerBar';
import NowPlaying from './NowPlaying';
import MenuHost from './MenuHost';

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
    </>
  );
}

import CallNotification from '@/components/CallNotification';
import ListOnlineUser from '@/components/ListOnlineUser';
import VideoCall from '@/components/VideoCall';
import React from 'react'

const Page = () => {
  return (
    <>
    <ListOnlineUser/>
    <CallNotification/>
    <VideoCall/>
    </>
  );
}

export default Page;
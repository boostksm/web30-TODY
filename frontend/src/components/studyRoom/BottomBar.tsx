/* eslint-disable no-param-reassign */
import styled from 'styled-components';
import { ReactComponent as MicIcon } from '@assets/icons/mic.svg';
import { ReactComponent as MicOffIcon } from '@assets/icons/mic-off.svg';
import { ReactComponent as VideoIcon } from '@assets/icons/video.svg';
import { ReactComponent as VideoOffIcon } from '@assets/icons/video-off.svg';
import { ReactComponent as CanvasIcon } from '@assets/icons/canvas.svg';
import { ReactComponent as ChatIcon } from '@assets/icons/chat.svg';
import { ReactComponent as ParticipantsIcon } from '@assets/icons/participants.svg';
import { ReactComponent as MonitorIcon } from '@assets/icons/monitor.svg';
import { ReactComponent as MonitorOffIcon } from '@assets/icons/monitor-off.svg';
import { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { userState } from 'recoil/atoms';
import { useNavigate, useParams } from 'react-router-dom';
import useAxios from '@hooks/useAxios';
import socket from 'sockets/sfuSocket';
import deleteRoomRequest from '../../axios/requests/deleteRoomRequest';
import checkMasterRequest from '../../axios/requests/checkMasterRequest';

const BottomBarLayout = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 96px;
  background-color: var(--yellow);
`;

const MenuList = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
`;
const MenuItem = styled.button`
  width: 110px;
  height: 72px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  align-items: center;
  background: none;
  padding: 0;
  border-radius: 10px;
  font-size: 17px;

  &:hover,
  &.active {
    background: rgba(255, 255, 255, 0.45);
  }
  &.text-red {
    color: var(--red);
    path {
      fill: var(--red);
    }
  }
`;

const IconWrapper = styled.span`
  height: 27.5px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const RoomExitButton = styled.button`
  position: absolute;
  top: 0;
  right: 30px;
  transform: translate(0, 50%);
  width: 108px;
  height: 46px;
  background-color: var(--orange);
  border-radius: 8px;
  color: var(--white);
  font-family: 'yg-jalnan';
  font-size: 20px;
  font-weight: 700;
`;
const RoomDeleteButton = styled.button`
  position: absolute;
  top: 0;
  right: 170px;
  transform: translate(0, 50%);
  width: 108px;
  height: 46px;
  background-color: var(--red);
  border-radius: 8px;
  color: var(--white);
  font-family: 'yg-jalnan';
  font-size: 20px;
  font-weight: 700;
`;

// interface Props {}

export default function BottomBar({
  myStream,
  isScreenShare,
  toggleScreenShare,
  setIsActiveCanvas,
  isActiveCanvas,
  activeSideBar,
  setActiveSideBar,
}: any) {
  const { roomId } = useParams();
  const user = useRecoilValue(userState);
  const navigate = useNavigate();
  const [myMediaState, setMyMediaState] = useState({ mic: false, video: true });
  const [requestDeleteRoom, , , deleteRoomData] =
    useAxios<''>(deleteRoomRequest);
  const [, , , isMaster] = useAxios<boolean>(checkMasterRequest, {
    onMount: true,
    arg: {
      studyRoomId: roomId,
      userId: user?.userId,
    },
  });

  const leaveRoom = useCallback(() => {
    navigate(`/study-rooms`);
  }, []);

  const deleteRoom = useCallback(() => {
    if (!window.confirm('방을 삭제하시겠습니까?')) return;
    requestDeleteRoom({
      studyRoomId: roomId,
    });
  }, []);

  useEffect(() => {
    socket.on('deletedThisRoom', () => {
      alert('방장이 공부방을 삭제했습니다 :(');
      leaveRoom();
    });
  }, []);

  useEffect(() => {
    if (deleteRoomData === null) return;
    alert('방이 삭제되었습니다.');
    socket.emit('deleteRoom', roomId);
    navigate(`/study-rooms`);
  }, [deleteRoomData]);

  useEffect(() => {
    if (!myStream.current) return;
    myStream.current.getAudioTracks().forEach((track: MediaStreamTrack) => {
      track.enabled = myMediaState.mic;
    });

    myStream.current.getVideoTracks().forEach((track: MediaStreamTrack) => {
      track.enabled = myMediaState.video;
    });
  }, [myMediaState]);

  const toggleMediaState = useCallback(
    (type: 'video' | 'mic') => {
      switch (type) {
        case 'video':
          setMyMediaState({
            ...myMediaState,
            video: !myMediaState.video,
          });
          break;
        case 'mic':
          setMyMediaState({
            ...myMediaState,
            mic: !myMediaState.mic,
          });
          break;
        default:
          break;
      }
    },
    [myMediaState],
  );

  const onClickSideBarMenu = useCallback(
    (clickedMenu: string) => {
      if (clickedMenu === activeSideBar) setActiveSideBar('');
      else setActiveSideBar(clickedMenu);
    },
    [activeSideBar],
  );

  const onClickButtons = useCallback(
    (e: any) => {
      const buttonEl = e.target.closest('button').textContent;

      switch (buttonEl) {
        case '':
          break;
        case '채팅':
        case '멤버':
          onClickSideBarMenu(buttonEl);
          break;
        case '마이크 끄기':
        case '마이크 켜기':
          toggleMediaState('mic');
          break;
        case '비디오 끄기':
        case '비디오 켜기':
          toggleMediaState('video');
          break;
        case '캔버스 공유':
          setIsActiveCanvas(!isActiveCanvas);
          break;
        default:
          break;
      }
    },
    [isActiveCanvas, onClickSideBarMenu, toggleMediaState],
  );

  return (
    <BottomBarLayout>
      <MenuList onClick={onClickButtons}>
        {myMediaState.mic ? (
          <MenuItem>
            <IconWrapper>
              <MicIcon />
            </IconWrapper>
            마이크 끄기
          </MenuItem>
        ) : (
          <MenuItem className="text-red">
            <IconWrapper>
              <MicOffIcon />
            </IconWrapper>
            마이크 켜기
          </MenuItem>
        )}
        {myMediaState.video ? (
          <MenuItem>
            <IconWrapper>
              <VideoIcon />
            </IconWrapper>
            비디오 끄기
          </MenuItem>
        ) : (
          <MenuItem className="text-red">
            <IconWrapper>
              <VideoOffIcon />
            </IconWrapper>
            비디오 켜기
          </MenuItem>
        )}
        {isScreenShare ? (
          <MenuItem onClick={toggleScreenShare}>
            <IconWrapper>
              <MonitorIcon />
            </IconWrapper>
            화면 공유
          </MenuItem>
        ) : (
          <MenuItem className="text-red" onClick={toggleScreenShare}>
            <IconWrapper>
              <MonitorOffIcon />
            </IconWrapper>
            화면 공유
          </MenuItem>
        )}
        <MenuItem className={isActiveCanvas ? 'active' : ''}>
          <IconWrapper>
            <CanvasIcon />
          </IconWrapper>
          캔버스 공유
        </MenuItem>
        <MenuItem className={activeSideBar === '채팅' ? 'active' : ''}>
          <IconWrapper>
            <ChatIcon />
          </IconWrapper>
          채팅
        </MenuItem>
        <MenuItem className={activeSideBar === '멤버' ? 'active' : ''}>
          <IconWrapper>
            <ParticipantsIcon />
          </IconWrapper>
          멤버
        </MenuItem>
      </MenuList>
      <RoomExitButton onClick={leaveRoom}>나가기</RoomExitButton>
      {isMaster ? (
        <RoomDeleteButton onClick={deleteRoom}>삭제</RoomDeleteButton>
      ) : null}
    </BottomBarLayout>
  );
}

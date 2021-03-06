// @flow
import React, { Component } from 'react';
import PlusIcon from 'react-icons/lib/fa/plus-square-o';
import MinusIcon from 'react-icons/lib/fa/minus-square-o';
import PostCommentInput from 'components/post/PostCommentInput/PostCommentInput';
import Button from 'components/common/Button';
import type { Comment, SubcommentsMap } from 'store/modules/posts';
import defaultThumbnail from 'static/images/default_thumbnail.png';
import { Link } from 'react-router-dom';
import { fromNow } from 'lib/common';
import cx from 'classnames';

import './PostComment.scss';

type Props = {
  username: ?string,
  thumbnail: ?string,
  comment: ?string,
  repliesCount: number,
  level: number,
  id: string,
  date: string,
  replies: ?(Comment[]),
  subcommentsMap: SubcommentsMap,
  onReply: (text: string, replyTo: ?string) => Promise<*>,
  onReadReplies: (commentId: string) => Promise<*>,
  logged: boolean,
  currentUsername: ?string,
  onOpenRemove: (payload: { commentId: string, parentId: ?string }) => any,
};

type State = {
  open: boolean,
  showInput: boolean,
};

class PostComment extends Component<Props, State> {
  static defaultProps = {
    repliesCount: 0,
    level: 0,
  };

  state = {
    open: false,
    showInput: false,
  };

  onOpen = () => {
    this.readReplies();
    this.setState({
      open: true,
      showInput: false,
    });
  };

  onClose = () => {
    this.setState({
      open: false,
    });
  };

  onShowInput = () => {
    this.setState({
      showInput: true,
    });
  };

  onHideInput = () => {
    this.setState({
      showInput: false,
    });
  };

  readReplies = () => {
    const { onReadReplies, id } = this.props;
    onReadReplies(id);
  };

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    const compare = (key) => {
      return nextProps[key] !== this.props[key];
    };

    return (
      this.state !== nextState ||
      compare('replies') ||
      compare('comment') ||
      compare('repliesCount') ||
      compare('subcommentsMap')
    );
  }

  render() {
    const {
      username,
      thumbnail,
      comment,
      repliesCount,
      level,
      id,
      onReply,
      replies,
      subcommentsMap,
      onReadReplies,
      date,
      logged,
      currentUsername,
      onOpenRemove,
    } = this.props;
    const { open, showInput } = this.state;

    const userProfileLink = `/@${username || ''}`;

    return (
      <div className="PostComment">
        <div className="comment-head">
          <Link to={userProfileLink}>
            <img src={thumbnail || defaultThumbnail} alt={username} />
          </Link>
          <div className="text-block">
            {username === null ? (
              <div className="username unknown">알 수 없음</div>
            ) : (
              <Link to={userProfileLink} className="username">
                {username}
              </Link>
            )}
            <div className="date">{fromNow(date)}</div>
          </div>
          {username === currentUsername && (
            <div className="actions">
              <button className="remove">삭제</button>
            </div>
          )}
        </div>
        <div
          className={cx('comment-body', {
            deleted: comment === null,
          })}
        >
          {comment || '삭제된 댓글입니다.'}
        </div>
        {level < 3 &&
          (open ? (
            <button className="replies-button" onClick={this.onClose}>
              <MinusIcon />
              숨기기
            </button>
          ) : (
            (logged || repliesCount > 0) && (
              <button className="replies-button" onClick={this.onOpen}>
                <PlusIcon />
                {repliesCount === 0 ? '답글 달기' : `${repliesCount}개의 답글`}
              </button>
            )
          ))}
        {open && (
          <section className="replies">
            {replies &&
              replies.map((reply) => {
                return (
                  <PostComment
                    logged={logged}
                    key={reply.id}
                    id={reply.id}
                    username={reply.user.username}
                    thumbnail={reply.user.thumbnail}
                    comment={reply.text}
                    date={reply.created_at}
                    replies={subcommentsMap[reply.id]}
                    repliesCount={reply.replies_count}
                    subcommentsMap={subcommentsMap}
                    onReadReplies={onReadReplies}
                    onReply={onReply}
                    level={level + 1}
                    currentUsername={currentUsername}
                    onOpenRemove={onOpenRemove}
                  />
                );
              })}
            {showInput ? (
              <PostCommentInput
                showCancel
                onCancel={this.onHideInput}
                onWriteComment={onReply}
                replyTo={id}
              />
            ) : (
              logged && (
                <button className="show-input-button" onClick={this.onShowInput}>
                  답글 작성하기
                </button>
              )
            )}
          </section>
        )}
      </div>
    );
  }
}

export default PostComment;

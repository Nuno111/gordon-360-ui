import { withStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import './nav-avatar.css';
import user from '../../../../services/user';
import { isAuthenticated } from '../../../../services/auth';

const styles = theme => ({
  drawerHeader: theme.mixins.toolbar,
});

class GordonNavAvatar extends Component {
  constructor(props) {
    super(props);
    this.getInitials = this.getInitials.bind(this);
    this.state = {
      email: null,
      image: null,
      name: null,
      username: null,
    };
  }
  async componentWillMount() {
    this.loadAvatar();
  }
  async componentWillReceiveProps() {
    this.loadAvatar();
  }
  componentDidMount() {
    setInterval(this.checkPeer.bind(this), 1500);
  }

  async loadAvatar() {
    if (this.props.Authentication) {
      const { name, user_name: username } = user.getLocalInfo();
      this.setState({ name, username });
      const [{ Email: email }, { def: defaultImage, pref: preferredImage }] = await Promise.all([
        await user.getProfileInfo(),
        await user.getImage(),
      ]);
      const image = preferredImage || defaultImage;
      this.setState({ email, image });
    } else {
      this.setState({ name: 'Guest', username: 'Guest' });
    }
  }

  /**
   * This method checks a peer component Profile
   * and rerenders the avatar if the Profile picture is updated
   */
  checkPeer() {
    if (window.didProfilePicUpdate) {
      this.loadAvatar();
      window.didProfilePicUpdate = false;
    }
  }
  getInitials() {
    if (this.state.username) {
      return this.state.username
        .split('.') // Split name into separate words
        .map(name => name[0]) // Get first letter of each part of name
        .join(''); // Join initials back into a string
    }
    return '';
  }
  render() {
    const { classes } = this.props;

    let content;
    if (this.props.Authentication) {
      let avatar = <Avatar className="avatar placeholder">{this.getInitials()}</Avatar>;
      if (this.state.image) {
        avatar = (
          <Avatar className="avatar image" src={`data:image/jpg;base64,${this.state.image}`} />
        );
      }

      // Link component to be used with Button component
      const buttonLink = ({ ...props }) => (
        <Link
          {...props}
          to={`/myprofile/${this.state.username}`}
          onClick={this.props.onLinkClick}
        />
      );

      content = (
        <Button
          className={`${classes.drawerHeader} gordon-nav-avatar`}
          classes={{
            root: 'gordon-nav-avatar button',
            label: 'label',
          }}
          component={buttonLink}
        >
          {avatar}
          <Typography variant="body2" className="avatar-text" align="left" gutterBottom>
            {this.state.name}
          </Typography>
          <Typography variant="caption" className="avatar-text" align="left" gutterBottom>
            {this.state.email}
          </Typography>
        </Button>
      );
    } else {
      let avatar = <Avatar className="avatar placeholder">Guest</Avatar>;
      // Link component to be used with Button component
      const buttonLink = ({ ...props }) => (
        <Link {...props} to={`/`} onClick={this.props.onLinkClick} />
      );

      content = (
        <Button
          className={`${classes.drawerHeader} gordon-nav-avatar`}
          classes={{
            root: 'gordon-nav-avatar button',
            label: 'label',
          }}
          component={buttonLink}
        >
          {avatar}
          <Typography variant="body2" className="avatar-text" align="left" gutterBottom>
            Guest
          </Typography>
        </Button>
      );
    }

    return content;
  }
}

GordonNavAvatar.propTypes = {
  classes: PropTypes.objectOf(PropTypes.string).isRequired,
  onLinkClick: PropTypes.func.isRequired,
};

export default withStyles(styles, { withTheme: true })(GordonNavAvatar);

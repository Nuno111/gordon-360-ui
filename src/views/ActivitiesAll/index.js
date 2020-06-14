import {
  Card,
  FormControl,
  Grid,
  Input,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@material-ui/core';
import React, { Component } from 'react';
import './activities-all.css';
import activity from '../../services/activity';
import session from '../../services/session';
import GordonActivityGrid from './components/ActivityGrid';
import GordonLoader from '../../components/Loader';
import user from './../../services/user';
import { gordonColors } from '../../theme';
import storage from '../../services/storage';

export default class GordonActivitiesAll extends Component {
  constructor(props) {
    super(props);
    this.changeSession = this.changeSession.bind(this);
    this.filter = this.filter.bind(this);

    this.state = {
      currentAcademicSession: '',
      profile: '',
      activities: [],
      allActivities: [],
      myInvolvements: [],
      error: null,
      loading: true,
      search: '',
      session: '',
      sessions: [],
      type: '',
      types: [],
      network: 'online',
    };
  }

  async componentDidUpdate() {
    window.onpopstate = e => {
      window.location.reload();
    };
  }

  async componentWillMount() {
    // this.setState({ loading: true });
    const { SessionCode: sessionCode } = await session.getCurrent();
    const [activities, types, sessions] = await Promise.all([
      activity.getAll(sessionCode),
      activity.getTypes(sessionCode),
      session.getAll(),
    ]);

    //Index of the array "activities" of current session
    var IcurrentSession;
    for (var i = 0; i < sessions.length; i++) {
      if (sessionCode === sessions[i].SessionCode) {
        IcurrentSession = i;
        break;
      }
    }

    let [pastActivities, pastTypes] = [[], []];
    let myPastInvolvements = [];
    let tempSession;
    var backButton = false;
    if (window.location.href.includes('?')) {
      backButton = true;
      tempSession = window.location.href.split('?')[1];
      this.setState({ session: tempSession, currentAcademicSession: tempSession });
      [pastActivities, pastTypes] = await Promise.all([
        activity.getAll(tempSession),
        activity.getTypes(tempSession),
      ]);
    }
    if (this.props.Authentication) {
      try {
        const profile = await user.getProfileInfo();
        const myInvolvements = await user.getSessionMembershipsWithoutGuests(
          profile.ID,
          sessionCode,
        );
        if (backButton) {
          myPastInvolvements = await user.getSessionMembershipsWithoutGuests(
            profile.ID,
            tempSession,
          );
          this.setState({
            profile,
            activities: pastActivities,
            allActivities: pastActivities,
            myInvolvements: myPastInvolvements,
            types: pastTypes,
            sessions: sessions,
          });
        } else if (activities.length === 0) {
          for (var k = IcurrentSession - 1; k >= 0; k--) {
            const [newActivities] = await Promise.all([activity.getAll(sessions[k].SessionCode)]);
            if (newActivities.length !== 0) {
              this.setState({
                session: sessions[k].SessionCode,
                sessions,
                activities: newActivities,
                allActivities: newActivities,
                myInvolvements: [],
                types,
                profile,
              });
              break;
            }
          }
        } else {
          this.setState({
            profile,
            session: sessionCode,
            activities,
            allActivities: activities,
            myInvolvements: myInvolvements,
            sessions,
            types,
          });
        }
      } catch (error) {
        this.setState({ error });
      }
    } else {
      try {
        if (backButton) {
          this.setState({
            activities: pastActivities,
            allActivities: pastActivities,
            types: pastTypes,
            sessions: sessions,
          });
        } else if (activities.length === 0) {
          for (k = IcurrentSession - 1; k >= 0; k--) {
            const [newActivities] = await Promise.all([activity.getAll(sessions[k].SessionCode)]);
            if (newActivities.length !== 0) {
              this.setState({
                session: sessions[k].SessionCode,
                sessions,
                activities: newActivities,
                allActivities: newActivities,
                types,
              });
              break;
            }
          }
        } else {
          this.setState({
            session: sessionCode,
            activities,
            allActivities: activities,
            sessions,
            types,
          });
        }
      } catch (error) {
        this.setState({ error });
      }
    }
    this.setState({ loading: false });
  }

  componentDidMount() {
    /* Used to re-render the page when the network connection changes.
     *  this.state.network is compared to the message received to prevent
     *  multiple re-renders that creates extreme performance lost.
     *  The origin of the message is checked to prevent cross-site scripting attacks
     */
    window.addEventListener('message', event => {
      if (
        event.data === 'online' &&
        this.state.network === 'offline' &&
        event.origin === window.location.origin
      ) {
        this.setState({ network: 'online' });
      } else if (
        event.data === 'offline' &&
        this.state.network === 'online' &&
        event.origin === window.location.origin
      ) {
        this.setState({ network: 'offline', linkopen: false });
      }
    });

    let network;
    /* Attempts to get the network status from local storage.
     * If not found, the default value is online
     */
    try {
      network = storage.get('network-status');
    } catch (error) {
      // Defaults the network to online if not found in local storage
      network = 'online';
    }

    // Saves the network's status to this component's state
    this.setState({ network });
  }

  async changeSession(event) {
    await this.setState({ session: event.target.value, loading: true });
    if (this.props.Authentication) {
      this.props.history.push(`?${this.state.session}`);
      const allActivities = await activity.getAll(this.state.session);
      const myInvolvements = await user.getSessionMembershipsWithoutGuests(
        this.state.profile.ID,
        this.state.session,
      );
      const { type, search } = this.state;
      await this.setState({
        activities: activity.filter(allActivities, type, search),
        allActivities,
        myInvolvements,
        loading: false,
      });
    } else {
      this.props.history.push(`?${this.state.session}`);
      const allActivities = await activity.getAll(this.state.session);
      const { type, search } = this.state;
      await this.setState({
        activities: activity.filter(allActivities, type, search),
        allActivities,
        loading: false,
      });
    }
  }

  filter(name) {
    return async event => {
      await this.setState({ [name]: event.target.value });
      const { allActivities, type, search } = this.state;
      await this.setState({ activities: activity.filter(allActivities, type, search) });
    };
  }

  /**
   * Creates the My Involvements text for both the header and if the user has no involvements
   *
   * @param {String} myInvolvementsHeadingText The My Involvements current session description
   * @param {String} myInvolvementsNoneText The My Involvements text if user has no involvements
   * @returns {Object} An object that contains both MyInvolvements header and no-involvements text
   */
  createMyInvolvementsText(myInvolvementsHeadingText, myInvolvementsNoneText) {
    // If the current session is the current academic session
    if (this.state.session === this.state.currentAcademicSession) {
      myInvolvementsHeadingText = 'CURRENT';
      myInvolvementsNoneText =
        "It looks like you're not currently a member of any Involvements. Get connected below!";
    }
    // If the current session is not the current academic session
    else {
      // Gets the description of the session
      let involvementDescription = this.state.sessions.filter(session => {
        return this.state.session === session.SessionCode;
      })[0].SessionDescription;
      myInvolvementsHeadingText = involvementDescription.toUpperCase();
      myInvolvementsNoneText = 'No Involvements found for ' + involvementDescription;
    }

    return { headingText: myInvolvementsHeadingText, noneText: myInvolvementsNoneText };
  }

  render() {
    // If an error occured while getting user's involvements, throw an error
    if (this.state.error) {
      throw this.state.error;
    }

    // Grid Header Style
    const headerStyle = {
      backgroundColor: gordonColors.primary.blue,
      color: '#FFF',
      padding: '10px',
    };

    // The user's involvements are defaulted to the Gordon loader until their data is fetched

    // Creates My Involvements
    let myInvolvements = <GordonLoader />; // Defaulted to the Gordon loader until user data is fetched
    let myInvolvementsText = this.createMyInvolvementsText();
    let myInvolvementsHeaderText = myInvolvementsText.headingText;
    let myInvolvementsNoneText = myInvolvementsText.noneText;

    // Creates All Involvements
    let allInvolvements = <GordonLoader />; // Defaulted to the Gordon loader until user data is fetched

    // Creates the involvements grids if the user's info was retrieved
    if (!this.state.loading) {
      myInvolvements = (
        <GordonActivityGrid
          myInvolvements={this.state.myInvolvements}
          sessionCode={this.state.session}
          noInvolvementsText={myInvolvementsNoneText}
        />
      );
      allInvolvements = (
        <GordonActivityGrid activities={this.state.activities} sessionCode={this.state.session} />
      );
    }

    // Creates the sessions list
    const sessionOptions = this.state.sessions.map(
      ({ SessionDescription: description, SessionCode: code }) => (
        <MenuItem label={description} value={code} key={code}>
          {description}
        </MenuItem>
      ),
    );

    // Creates the session types list
    const typeOptions = this.state.types.map(type => (
      <MenuItem value={type} key={type}>
        {type}
      </MenuItem>
    ));

    let fullContent = (
      <section className="activities-all">
        <Grid container justify="center" spacing={0}>
          <Grid item xs={12} md={12} lg={8}>
            <Grid container className="activities-filter" spacing={2}>
              <Grid item xs={12} md={12} lg={6}>
                <TextField
                  id="search"
                  label="Search"
                  value={this.state.search}
                  onChange={this.filter('search')}
                  margin="none"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <FormControl fullWidth>
                  <InputLabel htmlFor="activity-session">Session</InputLabel>
                  <Select
                    value={this.state.session}
                    onChange={this.changeSession}
                    input={<Input id="activity-session" />}
                  >
                    {sessionOptions}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <FormControl fullWidth>
                  <InputLabel htmlFor="activity-type">Type of Involvement</InputLabel>
                  <Select
                    value={this.state.type}
                    onChange={this.filter('type')}
                    input={<Input id="activity-type" />}
                  >
                    <MenuItem label="All" value="">
                      <em>All</em>
                    </MenuItem>
                    {typeOptions}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid container align="center" spacing={4} justify="center">
          {/* Shows My Involvements Header if the user is authenticated */}
          {this.props.Authentication && (
            <Grid item xs={12} lg={8} fullWidth>
              <Card>
                <div style={headerStyle}>
                  <Typography variant="body2" style={headerStyle}>
                    MY {myInvolvementsHeaderText} INVOLVEMENTS
                  </Typography>
                </div>
              </Card>
            </Grid>
          )}

          {/* Shows My Involvements Content if the user is authenticated */}
          {this.props.Authentication && (
            <Grid item xs={12} lg={8}>
              {myInvolvements}
            </Grid>
          )}

          <Grid item xs={12} lg={8}>
            <Card>
              <div style={headerStyle}>
                <Typography variant="body2" style={headerStyle}>
                  ALL INVOLVEMENTS
                </Typography>
              </div>
            </Card>
          </Grid>

          <Grid item xs={12} lg={8}>
            {allInvolvements}
          </Grid>
        </Grid>
      </section>
    );

    return <div>{fullContent}</div>;
  }
}

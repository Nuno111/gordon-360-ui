import React from 'react';
import { Grid, Typography, Button } from '@material-ui/core';
import { gordonColors } from 'theme';
import { Link } from 'react-router-dom';

// @TODO CSSMODULES - outside directory
import styles from '../../AcademicCheckIn.module.css';

const CompletedCheckIn = ({ basicInfo }) => {
  const cyan = gordonColors.primary.cyan;
  return (
    <Grid
      container
      alignItems="center"
      justifyContent="center"
      direction="column"
      className={styles.button_container}
    >
      <Grid item xs={8}>
        <Typography variant="h5" gutterBottom align="center" style={{ color: cyan }}>
          Congratulations {basicInfo.studentFirstName} on completing Academic Checkin!
        </Typography>
        <br />
        <Typography variant="body1" align="center" gutterBottom>
          We are excited to welcome you to your new semester at Gordon College! Please click the
          button below to return to the homepage.
        </Typography>
        <br />
        <Grid item align="center">
          <Button variant="contained" component={Link} to="/">
            Home
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default CompletedCheckIn;

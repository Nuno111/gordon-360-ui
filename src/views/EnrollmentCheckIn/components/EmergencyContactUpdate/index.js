// import React, { useState, useEffect } from 'react';
import {
  FormControl,
  FormControlLabel,
  InputLabel,
  Checkbox,
  Input,
  Grid,
  Typography,
  Box,
} from '@material-ui/core';
import { gordonColors } from 'theme';
import { phoneMaskUS, phoneMaskINTL } from 'views/AcademicCheckIn/components/UpdatePhone/';

// @TODO CSSMODULES - outside directory
import styles from '../../AcademicCheckIn.module.css';

const EmergencyContactUpdate = ({
  emergencyContact1,
  emergencyContact2,
  emergencyContact3,
  emergencyContactINTL1,
  emergencyContactINTL2,
  emergencyContactINTL3,
  handleChangeEmergContact1,
  handleChangeEmergContact2,
  handleChangeEmergContact3,
  handleCheckEmergContact1,
  handleCheckEmergContact2,
  handleCheckEmergContact3,
}) => {
  let cyan = gordonColors.primary.cyan;

  return (
    <Grid container justifyContent="center" alignItems="center" direction="column">
      <Typography align="center" variant="h5" gutterBottom style={{ color: cyan }}>
        Step 1: Enter your Emergency Contact Information
      </Typography>
      <Typography variant="h6" gutterBottom>
        <b>Who are your emergency contacts?</b>
      </Typography>
      <Typography variant="body1" gutterBottom>
        HIPAA regulations prohibit sharing of medical information regarding anyone age 18 or over
        without consent.
      </Typography>
      <Typography variant="body1" gutterBottom>
        By listing emergency contacts below, I authorize the Gordon College staff to share medical
        information with my emergency contact(s) during my enrollment at Gordon College. I hereby
        authorize Gordon College to contact the following person(s) listed below in the event of a
        medical emergency.
      </Typography>
      {createEmergencyContactFields(
        emergencyContact1,
        emergencyContactINTL1,
        handleChangeEmergContact1,
        handleCheckEmergContact1,
      )}
      {createEmergencyContactFields(
        emergencyContact2,
        emergencyContactINTL2,
        handleChangeEmergContact2,
        handleCheckEmergContact2,
      )}
      {createEmergencyContactFields(
        emergencyContact3,
        emergencyContactINTL3,
        handleChangeEmergContact3,
        handleCheckEmergContact3,
      )}
      <Grid item>
        <br />
      </Grid>
      <Typography variant="body2" gutterBottom>
        If, during the semester your emergency contact information must be updated, please contact
        Student Life at 978.867.4263.
      </Typography>
      <Typography variant="body2" gutterBottom>
        For international phone numbers, check the "International #" checkbox.
      </Typography>
    </Grid>
  );
};

/**
 * Helper function to return the emergency contact fields.
 *
 * @param {Object} emergencyContact the emergency contact to be updated.
 *
 * @param {Object} emergencyContactINTL the check for if a number is an international number
 *
 * @param {Function} handleChangeEmergContact a function to handle the updating of the fields
 *
 * @param {Function} handleCheckEmergContact a function to handle the updating of the checkbox fields
 *
 * @returns {JSX.Element} valid JSX for the emergency contact fields
 */
function createEmergencyContactFields(
  emergencyContact,
  emergencyContactINTL,
  handleChangeEmergContact,
  handleCheckEmergContact,
) {
  const contactNum = emergencyContact.SEQ_NUM;
  let required;
  if (
    contactNum === 1 ||
    emergencyContact.firstname !== '' ||
    emergencyContact.lastname !== '' ||
    emergencyContact.relationship !== '' ||
    emergencyContact.HomePhone !== '' ||
    emergencyContact.MobilePhone !== ''
  ) {
    required = true;
  } else {
    required = false;
  }
  return (
    <Box padding={2} align="center">
      <Typography variant="body1" gutterBottom>
        {' '}
        <strong>
          Emergency Contact {contactNum} {contactNum !== 1 ? '(optional)' : '(required)'}
        </strong>{' '}
      </Typography>
      <Grid container spacing={2} justifyContent="center">
        <Grid item>
          <FormControl className={styles.emergencyContactForm}>
            <InputLabel required={required} htmlFor="component-simple">
              First Name
            </InputLabel>
            <Input
              id="component-simple"
              name={'firstname'}
              value={emergencyContact.firstname}
              onChange={handleChangeEmergContact}
            />
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl className={styles.emergencyContactForm}>
            <InputLabel required={required} htmlFor="component-simple">
              Last Name
            </InputLabel>
            <Input
              id="component-simple"
              name={'lastname'}
              value={emergencyContact.lastname}
              onChange={handleChangeEmergContact}
              required
            />
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl className={styles.emergencyContactForm}>
            <InputLabel required={required} htmlFor="component-simple">
              Relationship
            </InputLabel>
            <Input
              id="component-simple"
              name={'relationship'}
              value={emergencyContact.relationship}
              onChange={handleChangeEmergContact}
              required
            />
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl className={styles.emergencyContactForm}>
            <InputLabel required={required} htmlFor="component-simple">
              Home Phone
            </InputLabel>
            <Input
              id="formatted-text-mask-input"
              name={'HomePhone'}
              value={emergencyContact.HomePhone}
              onChange={handleChangeEmergContact}
              inputComponent={emergencyContactINTL.HomePhoneIN ? phoneMaskINTL : phoneMaskUS}
              required
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={emergencyContactINTL.HomePhoneIN}
                  name={'HomePhoneIN'}
                  onChange={handleCheckEmergContact}
                />
              }
              label="International #"
            />
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl className={styles.emergencyContactForm}>
            <InputLabel required={required} htmlFor="component-simple">
              Mobile Phone
            </InputLabel>
            <Input
              id="formatted-text-mask-input"
              name={'MobilePhone'}
              value={emergencyContact.MobilePhone}
              onChange={handleChangeEmergContact}
              inputComponent={emergencyContactINTL.MobilePhoneIN ? phoneMaskINTL : phoneMaskUS}
              required
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={emergencyContactINTL.MobilePhoneIN}
                  name={'MobilePhoneIN'}
                  onChange={handleCheckEmergContact}
                />
              }
              label="International #"
            />
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
}

export default EmergencyContactUpdate;

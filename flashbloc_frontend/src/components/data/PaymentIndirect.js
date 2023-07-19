import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: '100vh',
    backgroundColor: 'black',
    padding: theme.spacing(4),
  },
  card: {
    width: '100%',
    maxWidth: '800px',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(2),
  },
  header: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: theme.spacing(4),
    textAlign: 'center',
  },
  text: {
    fontSize: '1.2rem',
    marginBottom: theme.spacing(4),
    textAlign: 'center',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: theme.spacing(2),
  },
  button: {
    marginLeft: theme.spacing(1),
  },
}));

function PaymentIndirectPage() {
  const classes = useStyles();

  const handleCreateChannel = () => {
    // Handle create channel logic
  };

  const handleBack = () => {
    // Handle back button logic
  };

  const handleProceed = () => {
    // Handle proceed button logic
  };
  

  return (
    <div className={classes.container}>
      <div className={classes.card}>
        <main className="mt-4 p-4">
          <Typography variant="h1" className={classes.header}>
            Payment Note
          </Typography>
          <Typography variant="body1" className={classes.text}>
            You do not have an existing Channel with the user.
            <br />
            Would you like to proceed with making payments using the indirect route?
            <br />
            Please note that the indirect route includes a 5% service charge.
          </Typography>
          <div className={classes.buttonContainer}>
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              onClick={handleProceed}
            >
              Proceed
            </Button>
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              onClick={handleCreateChannel}
            >
              Create Channel
            </Button>
            <Button
              variant="contained"
              color="secondary"
              className={classes.button}
              onClick={handleBack}
            >
              Back
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default PaymentIndirectPage;

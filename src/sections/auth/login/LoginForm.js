import axios from 'axios';
import * as Yup from 'yup';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  FormControl,
  Link,
  Stack,
  IconButton,
  InputAdornment,
  Modal,
  TextField,
  Box,
  Button,
  Divider,
  MenuItem,
  Select,
  Switch,
  Typography,
  FormControlLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { LoadingButton } from '@mui/lab';
// components
import { useSnackbar } from 'notistack';
import Iconify from '../../../components/Iconify';
import { FormProvider, RHFTextField, RHFCheckbox } from '../../../components/hook-form';

// ----------------------------------------------------------------------

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  width: 500,
  boxShadow: 24,
  p: 2,
  borderRadius: 2,
};

export default function LoginForm() {
  const navigate = useNavigate();

  const [open, setopen] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  // snackbar
  const { enqueueSnackbar } = useSnackbar();

  const [forgotEmail, setforgotEmail] = useState('');
  const [forgotEmailHelperText, setforgotEmailHelperText] = useState('');
  const [forgotError, setforgotError] = useState(false);
  const [loader, setloader] = useState(false);

  const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

  const ForgotSchema = Yup.object().shape({
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
  });

  const defaultValues = {
    email: '',
    password: '',
    remember: true,
  };

  const defaultValues2 = {
    email: '',
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    axios
      .post('/login', data)
      .then((res) => {
        localStorage.setItem('Bearer Token', res.data.token);
        localStorage.setItem('ud', JSON.stringify(res.data.user));
        window.location.reload();
      })
      .catch((err) => {
        console.log(err.response.data.message);
        enqueueSnackbar(err.response.data.message, {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'left',
          },
        });
      });
  };

  const handleClose = () => {
    setopen(false);
    setforgotEmailHelperText('');
    setforgotError(false);
  };

  // Forgot Password Call
  const forgot = async (e) => {
    e.preventDefault();
    const email = forgotEmail.trim();
    setforgotEmailHelperText('');
    setforgotError(false);

    if (email === '') {
      setforgotError(true);
      setforgotEmailHelperText('Please enter your email');
      setforgotEmail('');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setforgotError(true);
      setforgotEmailHelperText('Please enter a valid email');
      // setforgotEmail('');
      return;
    }
    console.log(forgotEmail);
    setloader(true);
    await axios
      .post('/forgot', {
        email: forgotEmail,
      })
      .then((res) => {
        enqueueSnackbar(res.data.message, {
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'left',
          },
        });
        setloader(false);
        handleClose();
      })
      .catch((err) => {
        console.log(err);
        setloader(false);
        enqueueSnackbar('Email not found, please enter another email', {
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'left',
          },
        });
      });
  };

  return (
    <>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <RHFTextField name="email" label="Email address" />

          <RHFTextField
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
          <RHFCheckbox name="remember" label="Remember me" />
          <Link variant="subtitle2" underline="hover" sx={{ cursor: 'pointer' }} onClick={() => setopen(true)}>
            Forgot password?
          </Link>
        </Stack>

        <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
          Login
        </LoadingButton>
      </FormProvider>

      {/* forgot pass modal */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Typography sx={{ mb: 2 }} id="modal-modal-title" variant="h5" component="h2">
            Please enter your email.
          </Typography>
          <form>
            <TextField
              helperText={forgotEmailHelperText}
              error={forgotError}
              required
              value={forgotEmail}
              onChange={(e) => setforgotEmail(e.target.value)}
              fullWidth
              type="email"
              color="primary"
              placeholder="Email"
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button disabled={loader} type="submit" onClick={(e) => forgot(e)}>
                Confirm
              </Button>
              <Button onClick={handleClose}>Cancel</Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </>
  );
}

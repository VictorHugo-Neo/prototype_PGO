export interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
}

export interface SecurityFormData {
  password: string;
  confirmPassword: string;
}

export interface ProfileStatusMessage {
  type: 'success' | 'error';
  text: string;
}

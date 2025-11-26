import { useAuth } from '../context/AuthContext';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { getAllOrganizations, createOrganization, Organization } from '../client-api/client';

export const OrganizationsPage: React.FC = () => {
  const { user } = useAuth();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const {
    data: organizations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['organizations'],
    queryFn: getAllOrganizations,
  });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({ name: '', description: '' });
  };

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      handleCloseDialog();
    },
  });

  const handleSave = () => {
    if (formData.name.trim()) {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error loading organizations</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Organizations</Typography>
        {user?.is_super_admin && (
          <Button variant="contained" color="primary" onClick={() => setIsDialogOpen(true)}>
            Add Organization
          </Button>
        )}
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Created At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {organizations?.map((org: Organization) => (
              <TableRow key={org.id}>
                <TableCell>{org.name}</TableCell>
                <TableCell>{org.description}</TableCell>
                <TableCell>{new Date(org.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {organizations?.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No organizations found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={isDialogOpen} onClose={() => handleCloseDialog()} maxWidth="sm" fullWidth>
        <DialogTitle>Add Organization</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Organization Name"
            type="text"
            fullWidth
            variant="outlined"
            sx={{ mb: 2, mt: 1 }}
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={createMutation.isPending || !formData.name.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

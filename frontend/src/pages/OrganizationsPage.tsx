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
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import {
  getAllOrganizations,
  createOrganization,
  deleteOrganization,
  updateOrganization,
  Organization,
} from '../client-api/client';

export const OrganizationsPage: React.FC = () => {
  const { user } = useAuth();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<Organization | null>(null);
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', description: '' });

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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string } }) =>
      updateOrganization(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setEditingOrgId(null);
      setEditFormData({ name: '', description: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setDeleteConfirmOpen(false);
      setOrgToDelete(null);
    },
  });

  const handleSave = () => {
    if (formData.name.trim()) {
      createMutation.mutate(formData);
    }
  };

  const handleEditClick = (org: Organization) => {
    setEditingOrgId(org.id);
    setEditFormData({ name: org.name, description: org.description });
  };

  const handleSaveEdit = () => {
    if (editingOrgId && editFormData.name.trim()) {
      updateMutation.mutate({ id: editingOrgId, data: editFormData });
    }
  };

  const handleCancelEdit = () => {
    setEditingOrgId(null);
    setEditFormData({ name: '', description: '' });
  };

  const handleDeleteClick = (org: Organization) => {
    setOrgToDelete(org);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (orgToDelete) {
      deleteMutation.mutate(orgToDelete.id);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setOrgToDelete(null);
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
              {user?.is_super_admin && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {organizations?.map((org: Organization) => (
              <TableRow key={org.id}>
                <TableCell>
                  {editingOrgId === org.id ? (
                    <TextField
                      value={editFormData.name}
                      onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                      size="small"
                      fullWidth
                    />
                  ) : (
                    org.name
                  )}
                </TableCell>
                <TableCell>
                  {editingOrgId === org.id ? (
                    <TextField
                      value={editFormData.description}
                      onChange={e =>
                        setEditFormData({ ...editFormData, description: e.target.value })
                      }
                      size="small"
                      fullWidth
                      multiline
                    />
                  ) : (
                    org.description
                  )}
                </TableCell>
                <TableCell>{new Date(org.created_at).toLocaleDateString()}</TableCell>
                {user?.is_super_admin && (
                  <TableCell align="right">
                    {editingOrgId === org.id ? (
                      <>
                        <IconButton
                          color="primary"
                          onClick={handleSaveEdit}
                          size="small"
                          disabled={updateMutation.isPending}
                        >
                          <SaveIcon />
                        </IconButton>
                        <IconButton
                          onClick={handleCancelEdit}
                          size="small"
                          disabled={updateMutation.isPending}
                        >
                          <CancelIcon />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton
                          color="primary"
                          onClick={() => handleEditClick(org)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(org)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
            {organizations?.length === 0 && (
              <TableRow>
                <TableCell colSpan={user?.is_super_admin ? 4 : 3} align="center">
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the organization <strong>{orgToDelete?.name}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={deleteMutation.isPending}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

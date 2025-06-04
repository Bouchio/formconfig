import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Link } from "react-router-dom";
import {
  Table,
  CircularProgress,
  Typography,
  Sheet,
  Button,
  Modal,
  ModalDialog,
  ModalClose,
  IconButton,
  Box,
  Stack,
  Input,
  Chip,
} from "@mui/joy";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { toast } from "react-hot-toast";
import { DELETE_USER } from "../graphql/mutations";
import { GET_USERS } from "../graphql/queries";

const UserList = () => {
  const { loading, error, data } = useQuery(GET_USERS);
  const [deleteUser, { loading: deleteLoading }] = useMutation(DELETE_USER, {
    onCompleted: () => {
      toast.success("User deleted successfully");
    },
    onError: (error) => {
      toast.error(`Error deleting user: ${error.message}`);
    },
    refetchQueries: [{ query: GET_USERS }],
  });
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const usersPerPage = 5;

  const handleOpenDeleteModal = (user) => {
    setUserToDelete(user);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteUser({ variables: { id: userToDelete._id } });
      setOpenDeleteModal(false);
      setUserToDelete(null);
      if (filteredUsers.length % usersPerPage === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      // Error handled by onError
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const filteredUsers =
    data?.users?.filter((user) =>
      [
        user.matricule,
        user.firstName,
        user.lastName,
        user.username,
        user.email,
      ].some((field) =>
        field?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    ) || [];

  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  if (loading) return <CircularProgress sx={{ mx: "auto", mt: 4 }} />;
  if (error)
    return (
      <Typography color="danger" sx={{ textAlign: "center", mt: 4 }}>
        Error: {error.message}
      </Typography>
    );

  return (
    <Box sx={{ maxWidth: "1200px", mx: "auto", py: 4 }}>
      <Sheet
        sx={{
          p: 3,
          borderRadius: "lg",
          bgcolor: "background.surface",
          overflowX: "auto",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3, gap: 2 }}
        >
          <Typography level="h2">User List</Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleSearchChange}
              startDecorator={<SearchIcon />}
              endDecorator={
                searchQuery && (
                  <IconButton onClick={handleClearSearch} size="sm">
                    <ClearIcon />
                  </IconButton>
                )
              }
              sx={{ width: { xs: "100%", sm: "300px" } }}
            />
            <Button
              component={Link}
              to="/create-user"
              variant="solid"
              color="primary"
              startDecorator={<AddIcon />}
              size="sm"
            >
              Create User
            </Button>
          </Stack>
        </Stack>
        <Table
          stripe="odd"
          hoverRow
          sx={{
            minWidth: "1000px",
            "--TableCell-headBackground": "#e3f2fd",
            "--TableCell-headColor": "#1e293b",
          }}
        >
          <thead>
            <tr>
              <th style={{ width: "12%" }}>Matricule</th>
              <th style={{ width: "15%" }}>First Name</th>
              <th style={{ width: "15%" }}>Last Name</th>
              <th style={{ width: "12%" }}>Username</th>
              <th style={{ width: "20%" }}>Email</th>
              <th style={{ width: "8%" }}>Age</th>
              <th style={{ width: "10%" }}>Birth Date</th>
              <th style={{ width: "8%" }}>Status</th>
              <th style={{ width: "10%", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr key={user._id}>
                <td>{user.matricule || "N/A"}</td>
                <td>{user.firstName || "N/A"}</td>
                <td>{user.lastName || "N/A"}</td>
                <td>{user.username || "N/A"}</td>
                <td>{user.email || "N/A"}</td>
                <td>{user.age || "N/A"}</td>
                <td>
                  {user.birthDate
                    ? new Date(user.birthDate).toLocaleDateString()
                    : "N/A"}
                </td>
                <td>
                  <Chip
                    color={user.isActive ? "success" : "warning"}
                    variant="soft"
                  >
                    {user.isActive ? "Active" : "Draft"}
                  </Chip>
                </td>
                <td style={{ textAlign: "center" }}>
                  <Button
                    component={Link}
                    to={`/edit-user/${user._id}`}
                    variant="outlined"
                    color="primary"
                    size="sm"
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <IconButton
                    color="danger"
                    size="sm"
                    onClick={() => handleOpenDeleteModal(user)}
                    disabled={deleteLoading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {totalUsers === 0 && (
          <Typography
            sx={{ textAlign: "center", py: 4, color: "text.secondary" }}
          >
            No users found matching your search.
          </Typography>
        )}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 3,
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
          <Typography level="body2">
            Showing {startIndex + 1} to {Math.min(endIndex, totalUsers)} of{" "}
            {totalUsers} users
          </Typography>
          <Stack direction="row" spacing={1}>
            {pageNumbers.map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "solid" : "outlined"}
                color="primary"
                size="sm"
                onClick={() => handlePageChange(page)}
                sx={{ minWidth: "36px", borderRadius: "50%" }}
              >
                {page}
              </Button>
            ))}
          </Stack>
        </Box>
        <Modal
          open={openDeleteModal}
          onClose={() => setOpenDeleteModal(false)}
        >
          <ModalDialog sx={{ p: 3, borderRadius: "lg", maxWidth: "400px" }}>
            <ModalClose />
            <Typography level="h4" sx={{ mb: 2 }}>
              Confirm Delete
            </Typography>
            <Typography sx={{ mb: 3 }}>
              Are you sure you want to delete {userToDelete?.firstName}{" "}
              {userToDelete?.lastName}?
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                color="neutral"
                onClick={() => setOpenDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="solid"
                color="danger"
                onClick={handleConfirmDelete}
                loading={deleteLoading}
              >
                Delete
              </Button>
            </Box>
          </ModalDialog>
        </Modal>
      </Sheet>
    </Box>
  );
};

export default UserList;
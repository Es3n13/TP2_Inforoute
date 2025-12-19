import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { logout, updateUserProfile, changePassword, fetchUserProfile } from "../features/auth/authSlice";
import Layout from "../components/Layout";
import { User, Mail, LogOut, Edit3, Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from "../components/ui/dialog";

export default function Profile() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, status, error } = useAppSelector(
    (state) => state.auth
  );
  const loading = status === "loading";


  const [open, setOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(fetchUserProfile());
    }
  }, [isAuthenticated, user, dispatch]);

  useEffect(() => {
    if (!isAuthenticated && !loading) navigate("/");
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (open && user) {
      setEmail(user.email || "");
      setPhoneNumber(user.phone_number || "");
    }
  }, [open, user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const handleOpenDialog = () => {
    setLocalError(null);
    setOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    await dispatch(
      updateUserProfile({
        email,
        phone_number: phoneNumber,
      })
    );

    if (oldPassword || newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setLocalError("Les nouveaux mots de passe ne correspondent pas.");
        return;
      }
      await dispatch(
        changePassword({
          old_password: oldPassword,
          new_password: newPassword,
        })
      );
    }

    setOpen(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  if (!isAuthenticated) return null;

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-600 mt-2">Informations de votre compte</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Infos en lecture seule */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg flex justify-between items-center">
                <CardTitle className="flex items-center text-xl">
                  <User className="mr-2 h-5 w-5" />
                  Informations du compte
                </CardTitle>
                <Button variant="secondary" onClick={handleOpenDialog}>
                  <Edit3 className="h-4 w-4 mr-1" />
                  Modifier
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Nom d’utilisateur</p>
                  <p className="text-lg font-semibold">{user?.username}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Adresse email
                    </p>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900">
                        {user?.email || "Non spécifié"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">
                      Numéro de téléphone
                    </p>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900">
                        {user?.phone_number || "Non spécifié"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Déconnexion */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-red-600 to-red-800 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-xl">
                  <LogOut className="mr-2 h-5 w-5" />
                  Déconnexion
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-4 text-sm">
                  Vous êtes actuellement connecté en tant que{" "}
                  <strong>{user?.username}</strong>.
                </p>

                <Button
                  onClick={handleLogout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Se déconnecter
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Édition */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier mon profil</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Adresse email</p>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Numéro de téléphone
                </p>
                <Input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <hr className="my-2" />

              <div className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                <p className="text-sm font-medium">Changer le mot de passe</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">
                  Laisser vide pour ne pas changer le mot de passe.
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Ancien mot de passe
                </p>
                <Input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Nouveau mot de passe
                </p>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Confirmer le nouveau mot de passe
                </p>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {(localError || error) && (
                <p className="text-red-600 text-sm">
                  {localError || error}
                </p>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
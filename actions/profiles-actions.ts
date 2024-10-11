"use server";

import { createProfile, deleteProfile, getAllProfiles, getProfileByUserId, updateProfile } from "@/db/queries/profiles-queries";
import { InsertProfile, SelectProfile } from "@/db/schema/profiles-schema";
import { ActionResult } from "@/types/actions/actions-types";
import { revalidatePath } from "next/cache";
import { db } from "@/db/db";
import { profilesTable } from "@/db/schema/profiles-schema";
import { eq } from "drizzle-orm";

export async function createProfileAction(data: InsertProfile): Promise<ActionResult<SelectProfile>> {
  try {
    const newProfile = await createProfile(data);
    revalidatePath("/");
    return { isSuccess: true, message: "Profile created successfully", data: newProfile };
  } catch (error) {
    return { isSuccess: false, message: "Failed to create profile" };
  }
}

export async function getProfileByUserIdAction(userId: string): Promise<ActionResult<SelectProfile | null>> {
  try {
    const profile = await getProfileByUserId(userId);
    return { isSuccess: true, message: "Profile retrieved successfully", data: profile };
  } catch (error) {
    return { isSuccess: false, message: "Failed to get profile" };
  }
}

export async function getAllProfilesAction(): Promise<ActionResult<SelectProfile[]>> {
  try {
    const profiles = await getAllProfiles();
    return { isSuccess: true, message: "Profiles retrieved successfully", data: profiles };
  } catch (error) {
    return { isSuccess: false, message: "Failed to get profiles" };
  }
}

export async function updateProfileAction(userId: string, data: Partial<InsertProfile>): Promise<ActionResult<SelectProfile>> {
  try {
    const updatedProfile = await updateProfile(userId, data);
    revalidatePath("/");
    return { isSuccess: true, message: "Profile updated successfully", data: updatedProfile };
  } catch (error) {
    return { isSuccess: false, message: "Failed to update profile" };
  }
}

export async function deleteProfileAction(userId: string): Promise<ActionResult<void>> {
  try {
    await deleteProfile(userId);
    revalidatePath("/");
    return { isSuccess: true, message: "Profile deleted successfully" };
  } catch (error) {
    return { isSuccess: false, message: "Failed to delete profile" };
  }
}

export async function updateMembershipAction(userId: string, membership: "free" | "pro"): Promise<ActionResult<SelectProfile>> {
  try {
    const updatedProfile = await updateProfile(userId, { membership });
    revalidatePath("/");
    return { isSuccess: true, message: "Membership updated successfully", data: updatedProfile };
  } catch (error) {
    return { isSuccess: false, message: "Failed to update membership" };
  }
}

export async function updateLastPaymentAction(
  userId: string, 
  amount: number, 
  date: Date
): Promise<ActionResult<SelectProfile>> {
  try {
    const updatedProfile = await updateProfile(userId, { 
      lastPaymentAmount: amount.toString(),
      lastPaymentDate: date
    });
    revalidatePath("/");
    return { isSuccess: true, message: "Last payment updated successfully", data: updatedProfile };
  } catch (error) {
    return { isSuccess: false, message: "Failed to update last payment" };
  }
}

export async function getUserProfileById(userId: string): Promise<ActionResult<{ firstName: string; lastName: string }>> {
  try {
    const profile = await db.select({
      firstName: profilesTable.firstName,
      lastName: profilesTable.lastName,
    })
    .from(profilesTable)
    .where(eq(profilesTable.userId, userId))
    .limit(1);

    if (profile.length === 0) {
      return { isSuccess: false, message: "User profile not found" };
    }

    const { firstName, lastName } = profile[0];

    // Handle potentially null values
    const safeFirstName = firstName || "";
    const safeLastName = lastName || "";

    return { 
      isSuccess: true, 
      data: { firstName: safeFirstName, lastName: safeLastName }, 
      message: "User profile retrieved successfully" 
    };
  } catch (error) {
    console.error("Failed to get user profile:", error);
    return { isSuccess: false, message: "Failed to get user profile" };
  }
}




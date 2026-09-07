/**
 * Utility function to log the patch data for debugging
 */
import { logger } from "@/utils/logger"

export function logPatchData(originalData: any, updatedData: any, patchData: any): void {
    logger.group("Patch Data Debug")
    logger.log("Original Data:", JSON.stringify(originalData, null, 2))
    logger.log("Updated Data:", JSON.stringify(updatedData, null, 2))
    logger.log("Patch Data:", JSON.stringify(patchData, null, 2))
    logger.groupEnd()
  }
  
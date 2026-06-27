import { useState, useCallback } from "react";
import {
  reviewSingleFile,
  reviewFullProject,
  reviewBatchFiles,
} from "../services/apiService";
import toast from "react-hot-toast";

const useCodeReview = () => {
  const [projectReview, setProjectReview] = useState(null);
  const [fileReviews, setFileReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviewingFile, setReviewingFile] = useState(false);

  const reviewProject = useCallback(async (repoId) => {
    setLoading(true);
    toast.loading("Reviewing project... this may take a moment.", {
      id: "review",
    });
    try {
      const res = await reviewFullProject(repoId);
      setProjectReview(res.data.data);
      toast.success("Project review complete!", { id: "review" });
      return res.data.data;
    } catch (error) {
      toast.error("Project review failed.", { id: "review" });
    } finally {
      setLoading(false);
    }
  }, []);

  const reviewFile = useCallback(async (fileId) => {
    setReviewingFile(true);
    try {
      const res = await reviewSingleFile(fileId);
      setFileReviews((prev) => [res.data.data, ...prev]);
      toast.success("File review complete!");
      return res.data.data;
    } catch (error) {
      toast.error("File review failed.");
    } finally {
      setReviewingFile(false);
    }
  }, []);

  const batchReview = useCallback(async (repoId, limit = 5) => {
    setLoading(true);
    toast.loading(`Reviewing top ${limit} files...`, { id: "batch" });
    try {
      const res = await reviewBatchFiles(repoId, limit);
      setFileReviews(res.data.data.reviews || []);
      toast.success("Batch review complete!", { id: "batch" });
      return res.data.data;
    } catch (error) {
      toast.error("Batch review failed.", { id: "batch" });
    } finally {
      setLoading(false);
    }
  }, []);

  const clearReviews = useCallback(() => {
    setProjectReview(null);
    setFileReviews([]);
  }, []);

  return {
    projectReview,
    fileReviews,
    loading,
    reviewingFile,
    reviewProject,
    reviewFile,
    batchReview,
    clearReviews,
  };
};

export default useCodeReview;
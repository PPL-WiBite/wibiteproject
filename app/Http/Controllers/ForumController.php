<?php

namespace App\Http\Controllers;

use App\Models\ForumComment;
use App\Models\ForumPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ForumController extends Controller
{
    public function index(): JsonResponse
    {
        $posts = ForumPost::orderBy('created_at', 'desc')->get();
        return response()->json($posts);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:200',
            'content' => 'required|string|max:10000',
            'category' => 'nullable|string',
        ]);

        $user = $request->user();

        $post = ForumPost::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'category' => $validated['category'] ?? 'Diskusi Umum',
            'author_id' => $user->id,
            'author_name' => $user->name,
        ]);

        return response()->json($post, 201);
    }

    public function update(Request $request, ForumPost $forumPost): JsonResponse
    {
        $user = $request->user();

        if ($forumPost->author_id !== $user->id && !$user->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:200',
            'content' => 'required|string|max:10000',
            'category' => 'nullable|string',
        ]);

        $forumPost->update($validated);

        return response()->json($forumPost);
    }

    public function destroy(Request $request, ForumPost $forumPost): JsonResponse
    {
        $user = $request->user();

        if ($forumPost->author_id !== $user->id && !$user->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $forumPost->delete();

        return response()->json(['success' => true]);
    }

    public function comments(ForumPost $forumPost): JsonResponse
    {
        $comments = $forumPost->comments()->orderBy('created_at', 'asc')->get();
        return response()->json($comments);
    }

    public function storeComment(Request $request, ForumPost $forumPost): JsonResponse
    {
        $validated = $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        $user = $request->user();

        $comment = ForumComment::create([
            'post_id' => $forumPost->id,
            'content' => $validated['content'],
            'author_id' => $user->id,
            'author_name' => $user->name,
        ]);

        return response()->json($comment, 201);
    }
}

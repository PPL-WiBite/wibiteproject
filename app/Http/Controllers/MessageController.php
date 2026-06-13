<?php

namespace App\Http\Controllers;

use App\Models\Claim;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * Pastikan user yang login adalah penerima claim atau donor makanan terkait.
     */
    private function authorizeParticipant(Claim $claim, $user): bool
    {
        $claim->loadMissing('food');
        return $claim->receiver_id === $user->id
            || ($claim->food && $claim->food->donor_id === $user->id);
    }

    public function index(Request $request, Claim $claim): JsonResponse
    {
        $user = $request->user();

        if (!$this->authorizeParticipant($claim, $user)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $messages = Message::where('claim_id', $claim->id)
            ->with('sender:id,name,role')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages);
    }

    public function store(Request $request, Claim $claim): JsonResponse
    {
        $user = $request->user();

        if (!$this->authorizeParticipant($claim, $user)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        $message = Message::create([
            'claim_id' => $claim->id,
            'sender_id' => $user->id,
            'content' => $validated['content'],
        ]);

        $message->load('sender:id,name,role');

        return response()->json($message, 201);
    }
}

class Ticket {
  final String id;
  final String ticketNumber;
  final String subject;
  final String message;
  final String status; // 'open', 'in_progress', 'resolved', 'closed'
  final String priority; // 'low', 'medium', 'high', 'urgent'
  final String category; // 'technical', 'financial', 'general'
  final User? user;
  final List<TicketMessage> messages;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final DateTime? resolvedAt;

  Ticket({
    required this.id,
    required this.ticketNumber,
    required this.subject,
    required this.message,
    required this.status,
    required this.priority,
    required this.category,
    this.user,
    required this.messages,
    required this.createdAt,
    this.updatedAt,
    this.resolvedAt,
  });

  factory Ticket.fromJson(Map<String, dynamic> json) {
    return Ticket(
      id: json['_id'] ?? json['id'],
      ticketNumber: json['ticketNumber'],
      subject: json['subject'],
      message: json['message'],
      status: json['status'],
      priority: json['priority'],
      category: json['category'],
      user: json['user'] != null ? User.fromJson(json['user']) : null,
      messages: (json['messages'] as List<dynamic>?)
          ?.map((msg) => TicketMessage.fromJson(msg))
          .toList() ?? [],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: json['updatedAt'] != null 
          ? DateTime.parse(json['updatedAt']) 
          : null,
      resolvedAt: json['resolvedAt'] != null 
          ? DateTime.parse(json['resolvedAt']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'subject': subject,
      'message': message,
      'priority': priority,
      'category': category,
    };
  }
}

class TicketMessage {
  final String id;
  final String message;
  final String senderType; // 'user', 'admin'
  final String? senderName;
  final List<String>? attachments;
  final DateTime createdAt;

  TicketMessage({
    required this.id,
    required this.message,
    required this.senderType,
    this.senderName,
    this.attachments,
    required this.createdAt,
  });

  factory TicketMessage.fromJson(Map<String, dynamic> json) {
    return TicketMessage(
      id: json['_id'] ?? json['id'],
      message: json['message'],
      senderType: json['senderType'],
      senderName: json['senderName'],
      attachments: json['attachments'] != null 
          ? List<String>.from(json['attachments']) 
          : null,
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'message': message,
      'senderType': senderType,
    };
  }
}

class VoiceCall {
  final String id;
  final String ticketId;
  final String status; // 'initiated', 'ringing', 'connected', 'ended'
  final String? channelName;
  final String? token;
  final DateTime createdAt;
  final DateTime? startedAt;
  final DateTime? endedAt;
  final int? duration; // in seconds

  VoiceCall({
    required this.id,
    required this.ticketId,
    required this.status,
    this.channelName,
    this.token,
    required this.createdAt,
    this.startedAt,
    this.endedAt,
    this.duration,
  });

  factory VoiceCall.fromJson(Map<String, dynamic> json) {
    return VoiceCall(
      id: json['_id'] ?? json['id'],
      ticketId: json['ticketId'],
      status: json['status'],
      channelName: json['channelName'],
      token: json['token'],
      createdAt: DateTime.parse(json['createdAt']),
      startedAt: json['startedAt'] != null 
          ? DateTime.parse(json['startedAt']) 
          : null,
      endedAt: json['endedAt'] != null 
          ? DateTime.parse(json['endedAt']) 
          : null,
      duration: json['duration'],
    );
  }
}